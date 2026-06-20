# netbox_site_docx/__init__.py
from netbox.plugins import PluginConfig

class NetBoxSiteDocxConfig(PluginConfig):
    name = 'netbox_site_docx'
    verbose_name = 'NetBox Site DOCX Exporter'
    description = 'Exports dynamic site rack visuals, devices, cables, and IPs to Word document'
    version = '1.0.0'
    base_url = 'site-docx'

config = NetBoxSiteDocxConfig