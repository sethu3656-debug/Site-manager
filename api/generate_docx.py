import sys
import os
import json
import pymysql
from docxtpl import DocxTemplate
from jinja2 import Environment

def safe_float(value):
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return 0.0

def none_if_blank(value):
    if value in (None, ""):
        return "None"
    return str(value)

def build_chains(devices, sites):
    chains = sorted({
        item.get("chain")
        for item in devices
        if item.get("chain") not in (None, "", "none", "None")
    })

    chains_data = []
    for chain in chains:
        chain_lower = chain.lower()
        antenna = [
            item for item in devices
            if item.get("chain", "").lower() == chain_lower
            and "antenna" in str(item.get("name", "")).lower()
        ]
        receiver = [
            item for item in devices
            if item.get("chain", "").lower() == chain_lower
            and "receiver" in str(item.get("name", "")).lower()
        ]
        rf_cables = [
            item for item in devices
            if item.get("chain", "").lower() == chain_lower
            and "cable" in str(item.get("name", "")).lower()
        ]

        rf_l1 = sum(safe_float(item.get("l1_delay")) for item in rf_cables)
        rf_l5 = sum(safe_float(item.get("l5_delay")) for item in rf_cables)
        rf_s = sum(safe_float(item.get("s_delay")) for item in rf_cables)

        if rf_l1 == 0 and rf_l5 == 0 and rf_s == 0 and sites:
            rf_l1 = safe_float(sites[0].get("l1_delay"))
            rf_l5 = safe_float(sites[0].get("l5_delay"))
            rf_s = safe_float(sites[0].get("s_delay"))

        ant_l1 = sum(safe_float(item.get("l1_delay")) for item in antenna)
        ant_l5 = sum(safe_float(item.get("l5_delay")) for item in antenna)
        ant_s = sum(safe_float(item.get("s_delay")) for item in antenna)

        rec_l1 = sum(safe_float(item.get("l1_delay")) for item in receiver)
        rec_l5 = sum(safe_float(item.get("l5_delay")) for item in receiver)
        rec_s = sum(safe_float(item.get("s_delay")) for item in receiver)

        delays = [
            {"device": "Antenna", "devices": "Antenna", "l1": rf_l1, "l5": ant_l5, "s": ant_s},
            {"device": "Receiver", "devices": "Receiver", "l1": rec_l1, "l5": rec_l5, "s": rec_s},
            {"device": "RF Cable", "devices": "RF Cable", "l1": rf_l1, "l5": rf_l5, "s": rf_s},
            {
                "device": "Total",
                "devices": "Total",
                "l1": ant_l1 + rec_l1 + rf_l1,
                "l5": ant_l5 + rec_l5 + rf_l5,
                "s": ant_s + rec_s + rf_s,
            },
        ]
        chains_data.append({"name": chain, "delays": delays})

    return chains_data

def build_ip_details(devices, ips):
    filtered_ips = []
    counter = 1

    for device in devices:
        primary_ip = device.get("ip_address")
        if primary_ip not in (None, "", "None"):
            filtered_ips.append({
                "s_no": counter,
                "device": device.get("name", "None"),
                "interface": "Primary IP",
                "ip_address": primary_ip,
                "description": "Device Primary Ip",
            })
            counter += 1

    for ip in ips:
        device_name = str(ip.get("device", "")).strip()
        device = next(
            (
                item for item in devices
                if str(item.get("name", "")).strip().lower() == device_name.lower()
            ),
            None,
        )
        if device and ip.get("ip_address") == device.get("ip_address"):
            continue

        ip_value = ip.get("address") or ip.get("ip_address") or ip.get("ip")
        if ip_value and str(ip_value).strip().lower() not in ("none", "", "null"):
            filtered_ips.append({
                "s_no": counter,
                "device": device_name or "None",
                "interface": ip.get("interface") or ip.get("name") or "Interface",
                "ip_address": ip_value,
                "description": ip.get("description") or "Interface IP",
            })
            counter += 1

    return filtered_ips

def main():
    if len(sys.argv) < 4:
        print("Usage: python generate_docx.py <site_id> <sections_comma_separated> <output_file_path>")
        sys.exit(1)

    site_id = int(sys.argv[1])
    sections = sys.argv[2].split(",")
    output_path = sys.argv[3]

    # Database Connection
    conn = pymysql.connect(
        host="localhost",
        port=3306,
        user="root",
        password="root",
        database="sitemanager",
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with conn.cursor() as cursor:
            # 1. Fetch Site
            cursor.execute("SELECT * FROM sites WHERE id = %s", (site_id,))
            site = cursor.fetchone()
            if not site:
                print(f"Site ID {site_id} not found.")
                sys.exit(1)

            site_cf = json.loads(site.get("custom_data") or "{}")
            sites_list = [{
                "site_id": site["slug"] or site["name"],
                "name": site["name"],
                "description": site["description"] or "None",
                "x1": site_cf.get("x", "None"),
                "y1": site_cf.get("y", "None"),
                "z1": site_cf.get("z", "None"),
                "x2": site_cf.get("x2", "None"),
                "y2": site_cf.get("y2", "None"),
                "z2": site_cf.get("z2", "None"),
                "latitude": none_if_blank(site["latitude"]),
                "latitude1": none_if_blank(site["latitude"]),
                "longitude": none_if_blank(site["longitude"]),
                "longitude1": none_if_blank(site["longitude"]),
                "height": site_cf.get("height", "None"),
                "height1": site_cf.get("height", "None"),
                "latitude2": site_cf.get("latitude2", "None"),
                "longitude2": site_cf.get("longitude2", "None"),
                "height2": site_cf.get("height2", "None"),
                "l1_delay": site_cf.get("l1_delay", "0"),
                "s_delay": site_cf.get("s_delay", "0"),
                "l5_delay": site_cf.get("l5_delay", "0"),
            }] if "sites" in sections else []

            # 2. Fetch Racks
            racks_list = []
            if "racks" in sections:
                cursor.execute("SELECT * FROM racks WHERE site_id = %s ORDER BY name", (site_id,))
                racks = cursor.fetchall()
                for rack in racks:
                    cursor.execute("SELECT COUNT(*) as count FROM devices WHERE rack_id = %s", (rack["id"],))
                    dev_count = cursor.fetchone()["count"]
                    racks_list.append({
                        "name": rack["name"],
                        "serial": rack["serial"] or "None",
                        "asset_id": rack["asset_tag"] or "None",
                        "site": site["name"],
                        "devices": dev_count,
                        "height": f"{rack['u_height']}U" if rack["u_height"] else "0U",
                    })

            # 3. Fetch Devices
            equipment_list = []
            if "equipment" in sections or "ips" in sections or "chains" in sections:
                cursor.execute("""
                    SELECT d.*, dt.model as type_model, dr.name as role_name, m.name as mfg_name, r.name as rack_name
                    FROM devices d
                    LEFT JOIN device_types dt ON d.device_type_id = dt.id
                    LEFT JOIN device_roles dr ON d.role_id = dr.id
                    LEFT JOIN manufacturers m ON dt.manufacturer_id = m.id
                    LEFT JOIN racks r ON d.rack_id = r.id
                    WHERE d.site_id = %s ORDER BY d.name
                """, (site_id,))
                devices = cursor.fetchall()
                for dev in devices:
                    cf = json.loads(dev.get("custom_data") or "{}")
                    
                    role_name = dev["role_name"] or "None"
                    dev_name_lower = (dev["name"] or "").lower()
                    if "receiver" in dev_name_lower:
                        device_type = "receiver"
                    elif "antenna" in dev_name_lower:
                        device_type = "antenna"
                    else:
                        device_type = role_name.lower()

                    rack_position = "None"
                    if dev["rack_name"] and dev["position"]:
                        rack_position = f"{dev['rack_name']} / U{dev['position']}"

                    primary_ip = "None"
                    if dev["primary_ip4_id"]:
                        cursor.execute("SELECT address FROM ip_addresses WHERE id = %s", (dev["primary_ip4_id"],))
                        ip_rec = cursor.fetchone()
                        if ip_rec:
                            primary_ip = ip_rec["address"]

                    equipment_list.append({
                        "name": dev["name"] or "Unnamed",
                        "device_type": device_type,
                        "role": role_name,
                        "site": site["name"],
                        "tenant": "None",
                        "rack": dev["rack_name"] or "None",
                        "location": rack_position,
                        "serial": dev["serial"] or "None",
                        "asset_id": dev["asset_tag"] or "None",
                        "ip_address": primary_ip,
                        "status": dev["status"] or "None",
                        "latitude": none_if_blank(cf.get("latitude")),
                        "longitude": none_if_blank(cf.get("longitude")),
                        "height": cf.get("height", "None"),
                        "manufacturer": dev["mfg_name"] or "None",
                        "chain": cf.get("chain", "None").lower(),
                        "po_number": cf.get("po_number", "None"),
                        "x": cf.get("x", "None"),
                        "y": cf.get("y", "None"),
                        "z": cf.get("z", "None"),
                        "l1_delay": cf.get("l1_delay", "0"),
                        "s_delay": cf.get("s_delay", "0"),
                        "l5_delay": cf.get("l5_delay", "0"),
                    })

            # 4. Fetch Cables
            cables_list = []
            if "cables" in sections:
                cursor.execute("""
                    SELECT c.*, 
                           ia.name as term_a, da.name as dev_a,
                           ib.name as term_b, db.name as dev_b
                    FROM cables c
                    JOIN interfaces ia ON c.a_side_object_id = ia.id
                    JOIN devices da ON ia.device_id = da.id
                    JOIN interfaces ib ON c.b_side_object_id = ib.id
                    JOIN devices db ON ib.device_id = db.id
                    WHERE da.site_id = %s OR db.site_id = %s
                    ORDER BY c.id
                """, (site_id, site_id))
                cables = cursor.fetchall()
                for cab in cables:
                    cab_len = f"{cab['length']} {cab['length_unit']}" if cab["length"] else "None"
                    cables_list.append({
                        "dev_a": cab["dev_a"] or "None",
                        "term_a": cab["term_a"] or "None",
                        "dev_b": cab["dev_b"] or "None",
                        "term_b": cab["term_b"] or "None",
                        "label": cab["description"] or f"#{cab['id']}",
                        "l1_delay": "0",
                        "s_delay": "0",
                        "l5_delay": "0",
                        "tenant": "None",
                        "length": cab_len,
                        "type": cab["type"] or "None",
                    })

            # 5. Fetch IPs
            ip_rows = []
            if "ips" in sections:
                cursor.execute("""
                    SELECT ip.*, i.name as interface_name, d.name as device_name
                    FROM ip_addresses ip
                    JOIN interfaces i ON ip.assigned_object_id = i.id
                    JOIN devices d ON i.device_id = d.id
                    WHERE d.site_id = %s
                    ORDER BY ip.address
                """, (site_id,))
                ips = cursor.fetchall()
                for ip in ips:
                    ip_rows.append({
                        "device": ip["device_name"] or "None",
                        "interface": ip["interface_name"] or "None",
                        "tenant": "None",
                        "ip_address": ip["address"],
                        "description": ip["description"] or "No Description",
                    })

            # Prepare Jinja Context
            context = {
                "sites": sites_list,
                "racks": racks_list,
                "equipment": equipment_list if "equipment" in sections else [],
                "cables": cables_list,
                "ips": build_ip_details(equipment_list, ip_rows) if "ips" in sections else [],
                "chains": build_chains(equipment_list, sites_list) if "chains" in sections else [],
            }

            # Locate Template
            template_path = os.path.join(os.path.dirname(__file__), "..", "netbox_site_docx", "Site Information.docx")
            if not os.path.exists(template_path):
                print(f"Jinja DOCX template not found at {template_path}")
                sys.exit(1)

            doc = DocxTemplate(template_path)
            jinja_env = Environment()
            jinja_env.filters["format_num"] = lambda value: f"{safe_float(value):.2f}"
            doc.render(context, jinja_env=jinja_env)
            doc.save(output_path)
            print("DOCX generated successfully.")

    finally:
        conn.close()

if __name__ == "__main__":
    main()
