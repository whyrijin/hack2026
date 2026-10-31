from django.urls import path

from .models import InvoiceStatus
from .views import (
    InvoiceDetailView, InvoiceListView, InvoicePaymentView, InvoicePDFView,
    InvoiceSendView, InvoiceTransitionView, PortalInvoicePDFView,
)


urlpatterns = [
    path("invoices/", InvoiceListView.as_view(), name="invoice-list"),
    path("invoices/<uuid:pk>/", InvoiceDetailView.as_view(), name="invoice-detail"),
    path("invoices/<uuid:pk>/confirm/", InvoiceTransitionView.as_view(target_status=InvoiceStatus.CONFIRMED), name="invoice-confirm"),
    path("invoices/<uuid:pk>/cancel/", InvoiceTransitionView.as_view(target_status=InvoiceStatus.CANCELLED), name="invoice-cancel"),
    path("invoices/<uuid:pk>/payments/", InvoicePaymentView.as_view(), name="invoice-payment"),
    path("invoices/<uuid:pk>/pdf/", InvoicePDFView.as_view(), name="invoice-pdf"),
    path("invoices/<uuid:pk>/send/", InvoiceSendView.as_view(), name="invoice-send"),
    path("portal/invoices/", InvoiceListView.as_view(portal=True), name="portal-invoice-list"),
    path("portal/invoices/<uuid:pk>/", InvoiceDetailView.as_view(portal=True), name="portal-invoice-detail"),
    path("portal/invoices/<uuid:pk>/pdf/", PortalInvoicePDFView.as_view(), name="portal-invoice-pdf"),
]
