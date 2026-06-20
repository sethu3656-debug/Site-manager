# netbox_site_docx/urls.py
from django.urls import path
from .views import ExportSiteDocxView

urlpatterns = [
    path('export/', ExportSiteDocxView.as_view(), name='export_site_docx'),
]