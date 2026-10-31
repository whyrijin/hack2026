from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class Plan(models.Model):
    class Cadence(models.TextChoices):
        DAILY = 'daily', 'Daily'
        WEEKLY = 'weekly', 'Weekly'
        MONTHLY = 'monthly', 'Monthly'
        YEARLY = 'yearly', 'Yearly'

    name = models.CharField(max_length=255, unique=True, db_index=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    billing_cadence = models.CharField(max_length=16, choices=Cadence.choices, default=Cadence.MONTHLY)
    minimum_quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    availability_start_date = models.DateField(default=timezone.localdate)
    availability_end_date = models.DateField(null=True, blank=True)
    auto_close = models.BooleanField(default=False)
    allow_early_closure = models.BooleanField(default=True)
    allow_pause = models.BooleanField(default=True)
    allow_renewal = models.BooleanField(default=True)
    taxes = models.ManyToManyField('products.TaxRule', related_name='plans', blank=True)
    payment_term = models.ForeignKey('plans.PaymentTerm', null=True, blank=True, on_delete=models.SET_NULL, related_name='plans')
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def cadence(self):
        return self.billing_cadence

    @property
    def available_from(self):
        return self.availability_start_date

    @property
    def available_until(self):
        return self.availability_end_date

    @property
    def active(self):
        return self.is_active

    @property
    def allow_early_close(self):
        return self.allow_early_closure

    @property
    def auto_close_on_expiry(self):
        return self.auto_close

    def clean(self):
        super().clean()
        if self.availability_end_date and self.availability_start_date > self.availability_end_date:
            from django.core.exceptions import ValidationError

            raise ValidationError({'availability_end_date': 'Availability end cannot be before the start date.'})

    def __str__(self):
        return self.name


class PaymentTerm(models.Model):
    name = models.CharField(max_length=64, unique=True)
    days_until_due = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
