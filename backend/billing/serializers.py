"""Shared invoice representation for the API and printable documents."""

from decimal import Decimal

from django.utils import timezone

from .models import InvoiceStatus


def serialize_invoice(invoice, *, portal=False):
    payments = list(invoice.payments.all())
    amount_paid = sum((payment.amount for payment in payments), Decimal("0.00"))
    balance = invoice.total - amount_paid
    customer = invoice.customer_snapshot or {}
    actions = ["pdf"]
    if not portal:
        if invoice.status == InvoiceStatus.DRAFT:
            actions.extend(["confirm", "cancel"])
        elif invoice.status == InvoiceStatus.CONFIRMED:
            if not amount_paid:
                actions.append("cancel")
            if balance > 0:
                actions.append("payments")
        if invoice.status in (InvoiceStatus.CONFIRMED, InvoiceStatus.PAID):
            actions.append("send")
    return {
        "id": str(invoice.pk), "invoice_number": invoice.invoice_number,
        "subscription_id": str(invoice.subscription_id),
        "customer_id": invoice.customer_id_snapshot or invoice.subscription.customer_id,
        "customer_name": customer.get("name") or invoice.subscription.customer.name,
        "customer_email": customer.get("email") or invoice.subscription.customer.email,
        "billing_address": customer.get("billing_address", ""),
        "status": invoice.status, "currency": invoice.currency,
        "subtotal": str(invoice.subtotal), "discount_total": str(invoice.discount_total),
        "tax_total": str(invoice.tax_total), "total": str(invoice.total),
        "amount_paid": format(amount_paid, ".2f"), "balance": format(balance, ".2f"),
        "period_start": invoice.period_start.isoformat(), "period_end": invoice.period_end.isoformat(),
        "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
        "confirmed_at": invoice.confirmed_at.isoformat() if invoice.confirmed_at else None,
        "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
        "cancelled_at": invoice.cancelled_at.isoformat() if invoice.cancelled_at else None,
        "cancellation_reason": invoice.cancellation_reason,
        "created_at": invoice.created_at.isoformat(),
        "is_overdue": bool(invoice.status == InvoiceStatus.CONFIRMED and balance > 0 and invoice.due_date and invoice.due_date < timezone.localdate()),
        "allowed_actions": actions,
        "lines": [{
            "id": str(line.pk), "line_number": line.line_number, "description": line.description,
            "quantity": str(line.quantity), "unit_price": str(line.unit_price),
            "gross_amount": str(line.gross_amount), "discount_amount": str(line.discount_amount),
            "taxable_amount": str(line.taxable_amount), "tax_rate": str(line.tax_rate or Decimal("0")),
            "tax_amount": str(line.tax_amount), "total_amount": str(line.total_amount),
        } for line in invoice.lines.all()],
        "payments": [{
            "id": str(payment.pk), "amount": str(payment.amount), "currency": payment.currency,
            "method": payment.method, "payment_date": timezone.localdate(payment.received_at).isoformat(),
            "received_at": payment.received_at.isoformat(), "reference": payment.reference,
        } for payment in payments],
    }
