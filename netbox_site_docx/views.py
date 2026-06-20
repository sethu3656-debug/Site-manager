import io
import os

from django.http import Http404, HttpResponse
from django.views.generic import View
from dcim.models import Cable, Device, Rack, Site
from ipam.models import IPAddress
from docxtpl import DocxTemplate
from jinja2 import Environment


TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "Site Information.docx")


def safe_float(value):
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return 0.0


def none_if_blank(value):
    if value in (None, ""):
        return "None"
    return str(value)


def custom_value(custom_fields, *keys, default="None"):
    for key in keys:
        value = custom_fields.get(key)
        if value not in (None, ""):
            return str(value)
    return default


def has_keyword(device, keyword):
    name = (device.name or "").lower()
    role = (device.role.name if device.role else "").lower()
    return keyword.lower() in name or keyword.lower() in role


def first_termination(terminations):
    if hasattr(terminations, "all"):
        terminations = list(terminations.all())
    return terminations[0] if terminations else None


def termination_device_name(termination):
    endpoint = getattr(termination, "termination", termination)
    device = getattr(endpoint, "device", None)
    return device.name if device else "None"


def termination_name(termination):
    endpoint = getattr(termination, "termination", termination)
    return getattr(endpoint, "name", None) or "None"


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
            {"device": "Antenna", "devices": "Antenna", "l1": ant_l1, "l5": ant_l5, "s": ant_s},
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
    allowed_roles = {"switch", "router", "firewall", "daps"}
    filtered_ips = []
    counter = 1

    for device in devices:
        role = str(device.get("role", "")).lower().strip()
        primary_ip = device.get("ip_address")
        if role in allowed_roles and primary_ip not in (None, "", "None"):
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
        if device and str(device.get("role", "")).lower().strip() in allowed_roles:
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


class ExportSiteDocxView(View):
    """
    Fetch real-time NetBox site data, push it into the bundled Word template,
    and return the rendered DOCX.
    """

    def get(self, request):
        site_id = request.GET.get("site_id")
        if not site_id:
            return HttpResponse("Bad Request: Missing site_id parameter.", status=400)

        try:
            site = Site.objects.get(id=site_id)
        except Site.DoesNotExist:
            raise Http404("Target Site not found.")

        site_cf = site.custom_field_data or {}
        sites = [{
            "site_id": site.slug or site.name,
            "name": site.name,
            "description": site.description or "None",
            "x1": custom_value(site_cf, "Position_X_chain_1", "x1", "x"),
            "y1": custom_value(site_cf, "Position_Y_chain_1", "y1", "y"),
            "z1": custom_value(site_cf, "Position_Z_chain_1", "z1", "z"),
            "x2": custom_value(site_cf, "Position_X_chain_2", "x2"),
            "y2": custom_value(site_cf, "Position_Y_chain_2", "y2"),
            "z2": custom_value(site_cf, "Position_Z_chain_2", "z2"),
            "latitude": none_if_blank(site.latitude),
            "latitude1": none_if_blank(site.latitude),
            "longitude": none_if_blank(site.longitude),
            "longitude1": none_if_blank(site.longitude),
            "height": custom_value(site_cf, "Height", "height"),
            "height1": custom_value(site_cf, "Height", "height1"),
            "latitude2": custom_value(site_cf, "Lattitude_chain_2", "Latitude_chain_2", "latitude2"),
            "longitude2": custom_value(site_cf, "Longitude_chain_2", "longitude2"),
            "height2": custom_value(site_cf, "Height_chain_2", "height2"),
            "l1_delay": custom_value(site_cf, "RF_L1_Delay", "l1_delay", default="0"),
            "s_delay": custom_value(site_cf, "RF_S_Delay", "s_delay", default="0"),
            "l5_delay": custom_value(site_cf, "RF_L5_Delay", "l5_delay", default="0"),
        }]

        device_qs = Device.objects.filter(site=site).select_related(
            "role", "site", "tenant", "rack", "device_type__manufacturer"
        ).distinct().order_by("name")

        equipment = []
        for device in device_qs:
            cf = device.custom_field_data or {}
            role_name = device.role.name if device.role else "None"
            if has_keyword(device, "receiver"):
                device_type = "receiver"
            elif has_keyword(device, "antenna"):
                device_type = "antenna"
            else:
                device_type = role_name.lower()

            rack_position = "None"
            if device.rack and device.position:
                rack_position = f"{device.rack.name} / U{device.position}"

            equipment.append({
                "name": device.name or "Unnamed",
                "device_type": device_type,
                "role": role_name,
                "site": device.site.name if device.site else "None",
                "tenant": device.tenant.name if device.tenant else "None",
                "rack": device.rack.name if device.rack else "None",
                "location": rack_position,
                "serial": device.serial or "None",
                "asset_id": device.asset_tag or "None",
                "ip_address": str(device.primary_ip) if device.primary_ip else "None",
                "status": str(device.status) if device.status else "None",
                "latitude": none_if_blank(getattr(device, "latitude", None)),
                "longitude": none_if_blank(getattr(device, "longitude", None)),
                "height": custom_value(cf, "Height", "height"),
                "manufacturer": (
                    device.device_type.manufacturer.name
                    if device.device_type and device.device_type.manufacturer
                    else "None"
                ),
                "chain": custom_value(cf, "chain").lower(),
                "po_number": custom_value(cf, "po_number"),
                "x": custom_value(cf, "Position_X", "x"),
                "y": custom_value(cf, "Position_Y", "y"),
                "z": custom_value(cf, "Position_Z", "z"),
                "l1_delay": custom_value(cf, "Rx_L1_Delay", "l1_delay", default="0"),
                "s_delay": custom_value(cf, "Rx_S_Delay", "s_delay", default="0"),
                "l5_delay": custom_value(cf, "Rx_L5_Delay", "l5_delay", default="0"),
            })

        racks = [
            {
                "name": rack.name,
                "serial": rack.serial or "None",
                "asset_id": rack.asset_tag or "None",
                "site": rack.site.name if rack.site else "None",
                "devices": rack.devices.count() if hasattr(rack, "devices") else 0,
                "height": f"{rack.u_height}U" if rack.u_height else "0U",
            }
            for rack in Rack.objects.filter(site=site).order_by("name")
        ]

        cables = Cable.objects.filter(
            terminations___device_id__in=device_qs.values_list("id", flat=True)
        ).distinct().order_by("id")

        cable_data = []
        for cable in cables:
            cf = cable.custom_field_data or {}
            a = first_termination(cable.a_terminations)
            b = first_termination(cable.b_terminations)
            cable_data.append({
                "dev_a": termination_device_name(a),
                "term_a": termination_name(a),
                "dev_b": termination_device_name(b),
                "term_b": termination_name(b),
                "label": cable.label or f"#{cable.id}",
                "l1_delay": custom_value(cf, "Rx_L1_Delay", "l1_delay"),
                "s_delay": custom_value(cf, "Rx_S_Delay", "s_delay"),
                "l5_delay": custom_value(cf, "Rx_L5_Delay", "l5_delay"),
                "tenant": cable.tenant.name if cable.tenant else "None",
                "length": f"{cable.length} {cable.length_unit}" if cable.length else "None",
                "type": str(cable.type) if cable.type else "None",
            })

        ip_rows = []
        ips = IPAddress.objects.filter(
            assigned_object_id__in=device_qs.values_list("interfaces__id", flat=True)
        ).distinct().order_by("address")
        for ip in ips:
            assigned = ip.assigned_object
            device_name = "None"
            interface_name = "None"
            if assigned:
                interface_name = getattr(assigned, "name", "None")
                device = getattr(assigned, "device", None)
                if device:
                    device_name = device.name

            ip_rows.append({
                "device": device_name,
                "interface": interface_name,
                "tenant": ip.tenant.name if ip.tenant else "None",
                "ip_address": str(ip.address),
                "description": ip.description or "No Description",
            })

        context = {
            "sites": sites,
            "racks": racks,
            "equipment": equipment,
            "cables": cable_data,
            "ips": build_ip_details(equipment, ip_rows),
            "chains": build_chains(equipment, sites),
        }

        doc = DocxTemplate(TEMPLATE_PATH)
        jinja_env = Environment()
        jinja_env.filters["format_num"] = lambda value: f"{safe_float(value):.2f}"
        doc.render(context, jinja_env=jinja_env)

        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)

        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
        safe_filename = site.slug.replace("-", "_")
        response["Content-Disposition"] = f"attachment; filename=site_spec_{safe_filename}.docx"

        return response
