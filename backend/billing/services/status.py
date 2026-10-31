"""Validated invoice status transitions."""

from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from billing.models import Invoice, InvoiceStatus


class InvalidInvoiceTransition(Exception):
    """Raised when an invoice moves between unsupported states."""


_ALLOWED_TRANSITIONS = {
    InvoiceStatus.DRAFT: {InvoiceStatus.CONFIRMED, InvoiceStatus.CANCELLED},
    InvoiceStatus.CONFIRMED: {InvoiceStatus.PAID, InvoiceStatus.CANCELLED},
    InvoiceStatus.PAID: set(),
    InvoiceStatus.CANCELLED: set(),
}


@transaction.atomic
def transition_invoice_status(invoice_id, new_status):
    try:
        new_status = InvoiceStatus(new_status)
    except ValueError as exc:
        raise InvalidInvoiceTransition(f"Unsupported invoice status: {new_status!r}.") from exc

    invoice = Invoice.objects.select_for_update().get(pk=invoice_id)
    if invoice.status == new_status:
        return invoice
    if new_status not in _ALLOWED_TRANSITIONS[InvoiceStatus(invoice.status)]:
        raise InvalidInvoiceTransition(f"Cannot move invoice from {invoice.status} to {new_status}.")
    if new_status == InvoiceStatus.CONFIRMED and not invoice.lines.exists():
        raise InvalidInvoiceTransition("An invoice needs at least one line before it can be confirmed.")

    now = timezone.now()
    invoice.status = new_status
    fields = ["status", "updated_at"]
    if new_status == InvoiceStatus.CONFIRMED:
        invoice.confirmed_at = now
        fields.append("confirmed_at")
        invoice.due_date = timezone.localdate(now) + timedelta(days=invoice.subscription.payment_term_days)
        fields.append("due_date")
    elif new_status == InvoiceStatus.PAID:
        invoice.paid_at = now
        fields.append("paid_at")
    elif new_status == InvoiceStatus.CANCELLED:
        invoice.cancelled_at = now
        fields.append("cancelled_at")
    invoice.save(update_fields=fields)
    return invoice
