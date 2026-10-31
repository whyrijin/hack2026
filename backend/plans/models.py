from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class PaymentTerm(models.Model):
    name = models.CharField(max_length=64, unique=True)
    days_until_due = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("days_until_due", "name")

    def __str__(self):
        return self.name


class Plan(models.Model):
    class BillingCadence(models.TextChoices):
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"
        YEARLY = "yearly", "Yearly"

    name = models.CharField(max_length=255, unique=True, db_index=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    billing_cadence = models.CharField(max_length=16, choices=BillingCadence.choices, default=BillingCadence.MONTHLY)
    minimum_quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    availability_start_date = models.DateField(default=timezone.localdate)
    availability_end_date = models.DateField(null=True, blank=True)
    auto_close = models.BooleanField(default=False)
    allow_early_closure = models.BooleanField(default=True)
    allow_pause = models.BooleanField(default=True)
    allow_renewal = models.BooleanField(default=True)
    taxes = models.ManyToManyField("products.TaxRule", blank=True, related_name="plans")
    payment_term = models.ForeignKey(
        PaymentTerm,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="plans",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        constraints = [
            models.CheckConstraint(check=models.Q(base_price__gte=0), name="plan_base_price_nonneg_ck"),
            models.CheckConstraint(check=models.Q(minimum_quantity__gte=1), name="plan_min_quantity_ck"),
            models.CheckConstraint(
                check=models.Q(availability_end_date__isnull=True)
                | models.Q(availability_end_date__gte=models.F("availability_start_date")),
                name="plan_availability_window_ck",
            ),
        ]

    def clean(self):
        super().clean()
        if self.availability_end_date and self.availability_start_date > self.availability_end_date:
            raise ValidationError({"availability_end_date": "End date must be on or after the start date."})

    def __str__(self):
        return self.name
