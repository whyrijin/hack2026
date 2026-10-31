"""Retry-safe recording of payments actually received by staff."""

from dataclasses import dataclass
from datetime import date, datetime, time
from decimal import Decimal, InvalidOperation

from django.db import IntegrityError, transaction
from django.db.models import Sum
from django.utils import timezone

from billing.models import Invoice, InvoiceStatus
from billing.services.status import transition_invoice_status
from .models import Payment


class InvalidPayment(ValueError):
    """Payment input or invoice state does not permit recording this payment."""


class PaymentConflict(InvalidPayment):
    """The idempotency key was already used for different payment details."""


@dataclass(frozen=True)
class PaymentResult:
    payment: Payment
    created: bool


def _check_existing(payment, *, invoice, amount, method, payment_date, reference, note):
    if (
        payment.invoice_id != invoice.pk or payment.amount != amount or payment.method != method
        or timezone.localdate(payment.received_at) != payment_date or payment.reference != reference
        or payment.note != note or payment.currency != invoice.currency
    ):
        raise PaymentConflict("This idempotency key has already been used for a different payment.")
    return PaymentResult(payment=payment, created=False)


@transaction.atomic
def record_payment(invoice_id, *, amount, method, payment_date, reference="", idempotency_key, note=""):
    """Lock the invoice before checking its balance and writing one immutable receipt."""
    try:
        if isinstance(amount, (float, bool)):
            raise ValueError
        amount = Decimal(str(amount))
        if not amount.is_finite() or amount <= 0 or amount > Decimal("9999999999.99"):
            raise ValueError
        if amount != amount.quantize(Decimal("0.01")):
            raise ValueError
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise InvalidPayment("Amount must be positive with at most two decimal places.") from exc
    if isinstance(payment_date, datetime) or not isinstance(payment_date, date) or payment_date > timezone.localdate():
        raise InvalidPayment("Payment date must be today or earlier.")
    for value, label, length, required in (
        (method, "Method", 40, True), (idempotency_key, "Idempotency key", 128, True),
        (reference, "Reference", 128, False), (note, "Note", 2000, False),
    ):
        if not isinstance(value, str) or len(value.strip()) > length or (required and not value.strip()):
            raise InvalidPayment(f"{label} is invalid.")
    method, idempotency_key, reference, note = (value.strip() for value in (method, idempotency_key, reference, note))
    invoice = Invoice.objects.select_for_update().get(pk=invoice_id)
    details = dict(invoice=invoice, amount=amount, method=method, payment_date=payment_date, reference=reference, note=note)
    existing = Payment.objects.filter(idempotency_key=idempotency_key).first()
    if existing:
        return _check_existing(existing, **details)
    if invoice.status != InvoiceStatus.CONFIRMED:
        raise InvalidPayment("Payments can only be recorded for a confirmed invoice with an outstanding balance.")
    amount_paid = invoice.payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    if amount > invoice.total - amount_paid:
        raise InvalidPayment("Payment amount exceeds the remaining invoice balance.")
    received_at = timezone.make_aware(datetime.combine(payment_date, time.min), timezone.get_current_timezone())
    try:
        with transaction.atomic():
            payment = Payment.objects.create(
                invoice=invoice, amount=amount, method=method, currency=invoice.currency,
                received_at=received_at, reference=reference, note=note, idempotency_key=idempotency_key,
            )
    except IntegrityError:
        # A different invoice may concurrently receive the same global request key.
        existing = Payment.objects.filter(idempotency_key=idempotency_key).first()
        if existing is None:
            raise
        return _check_existing(existing, **details)
    if amount_paid + amount == invoice.total:
        transition_invoice_status(invoice.pk, InvoiceStatus.PAID)
    else:
        invoice.save(update_fields=("updated_at",))
    return PaymentResult(payment=payment, created=True)
