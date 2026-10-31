import uuid

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from plans.models import Plan

class Subscription(models.Model):
    class Status(models.TextChoices):
        DRAFT = "Draft", "Draft"
        QUOTATION = "Quotation", "Quotation"
        CONFIRMED = "Confirmed", "Confirmed"
        ACTIVE = "Active", "Active"
        CLOSED = "Closed", "Closed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT, db_index=True)
    plan = models.ForeignKey(
        "plans.Plan",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )
    customer_id = models.PositiveBigIntegerField(null=True, blank=True, db_index=True)
    plan_base_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    plan_tax_rate_snapshot = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at', '-id']
        indexes = [models.Index(fields=['status', 'next_billing_date'])]

    def save(self, *args, **kwargs):
        creating = self._state.adding
        if creating and self.billing_anchor_day is None:
            self.billing_anchor_day = self.start_date.day
        if creating and self.billing_anchor_month is None:
            self.billing_anchor_month = self.start_date.month
        if creating and not self.number:
            self.number = f'SUB-{self.pk.hex[:12].upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Subscription {self.pk} ({self.status})"


class SubscriptionLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey("products.Product", on_delete=models.PROTECT, related_name="subscription_lines")
    variant = models.ForeignKey(
        "products.ProductVariant",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="subscription_lines",
    )
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    taxes = models.ManyToManyField("products.TaxRule", blank=True, related_name="subscription_lines")
    product_name_snapshot = models.CharField(max_length=255, blank=True)
    unit_sales_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    variant_adjustment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    effective_unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    line_subtotal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    line_net_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    final_line_total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gte=1), name="subscription_line_quantity_ck"),
        ]

    def clean(self):
        super().clean()
        if self.variant_id and self.product_id and self.variant.product_id != self.product_id:
            raise ValidationError({"variant": "Selected variant does not belong to the selected product."})
        if self.effective_unit_price is not None and self.effective_unit_price < 0:
            raise ValidationError({"effective_unit_price": "Effective unit price cannot be negative."})

    def __str__(self):
        return f"{self.product_name_snapshot or self.product} × {self.quantity}"
