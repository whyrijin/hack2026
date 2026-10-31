import uuid

from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F, Q
from django.db.models.functions import Lower
from django.utils import timezone


class DiscountRule(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage"
        FIXED_AMOUNT = "fixed_amount", "Fixed amount"

    class Scope(models.TextChoices):
        ORDER = "order", "Order"
        PLAN = "plan", "Plan"
        LINES = "lines", "Lines"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    name = models.CharField(max_length=255)
    discount_type = models.CharField(max_length=16, choices=DiscountType.choices, default=DiscountType.PERCENTAGE)
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    scope = models.CharField(max_length=16, choices=Scope.choices, default=Scope.ORDER)
    min_order_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    minimum_quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    max_discount_cap = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    products = models.ManyToManyField("products.Product", blank=True, related_name="discount_rules")
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField(null=True, blank=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    times_reserved = models.PositiveIntegerField(default=0)
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("code"), name="discount_rule_code_ci_uniq", condition=Q(code__isnull=False)),
            models.CheckConstraint(
                check=Q(valid_to__isnull=True) | Q(valid_to__gte=F("valid_from")),
                name="discount_rule_valid_window",
            ),
            models.CheckConstraint(
                check=Q(max_uses__isnull=True) | Q(times_used__lte=F("max_uses") - F("times_reserved")),
                name="discount_quota_ck",
            ),
            models.CheckConstraint(
                check=~Q(discount_type="percentage") | Q(value__lte=100),
                name="discount_pct_max_ck",
            ),
            models.CheckConstraint(check=Q(value__gte=0), name="discount_value_nonneg_ck"),
            models.CheckConstraint(
                check=Q(min_order_amount__isnull=True) | Q(min_order_amount__gte=0),
                name="discount_min_order_nonneg_ck",
            ),
            models.CheckConstraint(check=Q(minimum_quantity__gte=1), name="discount_min_quantity_ck"),
            models.CheckConstraint(
                check=Q(max_discount_cap__isnull=True) | Q(max_discount_cap__gte=0),
                name="discount_cap_nonneg_ck",
            ),
        ]
        ordering = ("name",)

    def clean(self):
        super().clean()
        if self.discount_type == self.DiscountType.PERCENTAGE and self.value > 100:
            from django.core.exceptions import ValidationError

            raise ValidationError({"value": "Percentage discounts cannot exceed 100."})

    def save(self, *args, **kwargs):
        if self.code is not None:
            self.code = self.code.strip().upper() or None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.code or self.name


class DiscountReservation(models.Model):
    class Status(models.TextChoices):
        RESERVED = "reserved", "Reserved"
        CONSUMED = "consumed", "Consumed"
        RELEASED = "released", "Released"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    discount_rule = models.ForeignKey(DiscountRule, on_delete=models.PROTECT, related_name="reservations")
    quote_id = models.UUIDField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.RESERVED)
    expires_at = models.DateTimeField(null=True, blank=True)
    consumed_at = models.DateTimeField(null=True, blank=True)
    released_at = models.DateTimeField(null=True, blank=True)
    release_reason = models.CharField(max_length=255, blank=True)
    invoice_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("discount_rule", "quote_id"), name="discount_resv_quote_uq"),
        ]
        indexes = [models.Index(fields=("status", "expires_at"), name="discount_resv_expiry_idx")]

    def __str__(self):
        return f"{self.discount_rule_id} for quote {self.quote_id} ({self.status})"
