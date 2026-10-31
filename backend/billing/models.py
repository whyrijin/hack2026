import uuid

from django.core.validators import MinValueValidator
from django.db import models, transaction
from django.db.models import F, Q


class InvoiceStatus(models.TextChoices):
    DRAFT = "Draft", "Draft"
    CONFIRMED = "Confirmed", "Confirmed"
    PAID = "Paid", "Paid"
    CANCELLED = "Cancelled", "Cancelled"


class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(
        "subscriptions.Subscription",
        on_delete=models.PROTECT,
        related_name="invoices",
    )
    period_start = models.DateField()
    period_end = models.DateField()
    status = models.CharField(max_length=16, choices=InvoiceStatus.choices, default=InvoiceStatus.DRAFT)
    currency = models.CharField(max_length=3, default="INR")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    tax_total = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    due_date = models.DateField(null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("subscription", "period_start"),
                name="inv_sub_period_uq",
            ),
            models.CheckConstraint(
                check=Q(period_end__gt=F("period_start")),
                name="billing_invoice_period_valid",
            ),
            models.CheckConstraint(
                check=Q(subtotal__gte=0, discount_total__gte=0, tax_total__gte=0, total__gte=0),
                name="inv_totals_nonneg_ck",
            ),
            models.CheckConstraint(
                check=Q(discount_total__lte=F("subtotal")),
                name="inv_discount_lte_subtotal_ck",
            ),
        ]
        ordering = ("-created_at",)

    def __str__(self):
        return f"Invoice {self.pk} ({self.status})"


class InvoiceLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")
    line_number = models.PositiveIntegerField()
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=12, decimal_places=3, validators=[MinValueValidator(0)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    taxable_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    tax_rate = models.DecimalField(max_digits=7, decimal_places=4, null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    source_type = models.CharField(max_length=32, blank=True)
    # Catalog records currently use integer IDs; store a string so invoice
    # snapshots can also reference future UUID-backed sources without coercion.
    source_id = models.CharField(max_length=64, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("invoice", "line_number"), name="inv_line_num_uq"),
            models.CheckConstraint(check=Q(quantity__gt=0), name="billing_line_quantity_positive"),
            models.CheckConstraint(
                check=Q(
                    unit_price__gte=0,
                    gross_amount__gte=0,
                    discount_amount__gte=0,
                    taxable_amount__gte=0,
                    tax_amount__gte=0,
                    total_amount__gte=0,
                ),
                name="inv_line_amounts_ck",
            ),
            models.CheckConstraint(
                check=Q(discount_amount__lte=F("gross_amount")),
                name="inv_line_discount_lte_gross_ck",
            ),
        ]
        ordering = ("line_number",)

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self._state.adding:
                previous = type(self).objects.select_for_update().only("invoice_id").get(pk=self.pk)
                if previous.invoice_id != self.invoice_id:
                    raise ValueError("An invoice line cannot be moved to another invoice.")
            invoice = Invoice.objects.select_for_update().only("status").get(pk=self.invoice_id)
            if invoice.status != InvoiceStatus.DRAFT:
                raise ValueError("Invoice lines cannot be changed after the invoice leaves Draft.")
            super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        with transaction.atomic():
            invoice = Invoice.objects.select_for_update().only("status").get(pk=self.invoice_id)
            if invoice.status != InvoiceStatus.DRAFT:
                raise ValueError("Invoice lines cannot be deleted after the invoice leaves Draft.")
            return super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_id} line {self.line_number}: {self.description}"
