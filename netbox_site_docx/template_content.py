from dcim.models import Cable, Device, Rack
from ipam.models import IPAddress
from netbox.plugins import PluginTemplateExtension


def first_termination(terminations):
    if hasattr(terminations, "all"):
        terminations = list(terminations.all())
    return terminations[0] if terminations else None


def termination_label(termination):
    endpoint = getattr(termination, "termination", termination)
    if not endpoint:
        return "Open End"

    device = getattr(endpoint, "device", None)
    name = getattr(endpoint, "name", None)
    if device and name:
        return f"{device.name} [{name}]"
    return name or str(endpoint)


class SiteDocxSiteTabs(PluginTemplateExtension):
    models = ["dcim.site"]

    def buttons(self):
        return self.render("netbox_site_docx/export_button.html")

    def full_width_page(self):
        site = self.context["object"]
        devices = Device.objects.filter(site=site).select_related(
            "role", "device_type__manufacturer", "rack", "primary_ip4", "primary_ip6"
        ).order_by("name")
        device_ids = list(devices.values_list("id", flat=True))

        cables = Cable.objects.filter(
            terminations___device_id__in=device_ids
        ).distinct().order_by("id")
        cable_rows = []
        for cable in cables:
            cable_rows.append({
                "object": cable,
                "side_a": termination_label(first_termination(cable.a_terminations)),
                "side_b": termination_label(first_termination(cable.b_terminations)),
                "label": cable.label or f"#{cable.id}",
                "status": cable.get_status_display(),
                "type": cable.get_type_display() or cable.type or "N/A",
                "color": cable.color,
            })

        ip_addresses = IPAddress.objects.filter(
            assigned_object_id__in=devices.values_list("interfaces__id", flat=True)
        ).distinct().order_by("address")
        ip_rows = []
        for ip in ip_addresses:
            assigned = ip.assigned_object
            device = getattr(assigned, "device", None) if assigned else None
            ip_rows.append({
                "object": ip,
                "device": device,
                "interface": assigned,
                "address": ip.address,
                "status": ip.get_status_display(),
                "role": ip.get_role_display() or "N/A",
                "description": ip.description,
            })

        rack_rows = []
        for rack in Rack.objects.filter(site=site).order_by("name"):
            units = []
            for unit in rack.get_rack_units(face=0):
                units.append({
                    "id": unit["id"],
                    "device": unit.get("device"),
                })
            rack_rows.append({
                "object": rack,
                "units": units,
            })

        return self.render(
            "netbox_site_docx/site_tabs.html",
            {
                "devices": devices,
                "cables": cable_rows,
                "ip_addresses": ip_rows,
                "racks": rack_rows,
            },
        )


template_extensions = [SiteDocxSiteTabs]
