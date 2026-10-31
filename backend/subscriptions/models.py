import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from plans.models import Plan


class Subscription(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        QUOTATION = 'quotation', 'Quotation'
        CONFIRMED = 'confirmed', 'Confirmed'
        ACTIVE = 'active', 'Active'
        PAUSED = 'paused', 'Paused'
        EXPIRED = 'expired', 'Expired'
        CLOSED = 'closed', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    number = models.CharField(max_length=24, unique=True, blank=True)
    customer = models.ForeignKey('customers.Customer', related_name='subscriptions', on_delete=models.PROTECT)
    plan = models.ForeignKey('plans.Plan', related_name='subscriptions', on_delete=models.PROTECT)
    template = models.ForeignKey('quotations.QuoteTemplate', null=True, blank=True, on_delete=models.SET_NULL)
    renewal_of = models.ForeignKey('self', null=True, blank=True, related_name='renewals', on_delete=models.PROTECT)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT, db_index=True)
    cadence = models.CharField(max_length=16, choices=Plan.Cadence.choices)
    start_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    quote_valid_until = models.DateField(null=True, blank=True)
    payment_term_days = models.PositiveSmallIntegerField(default=0)
    currency = models.CharField(max_length=3, default='INR')
    base_price_snapshot = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    minimum_quantity_snapshot = models.PositiveIntegerField(default=1)
    allow_pause_snapshot = models.BooleanField(default=False)
    allow_early_close_snapshot = models.BooleanField(default=False)
    allow_renewal_snapshot = models.BooleanField(default=False)
    auto_close_on_expiry_snapshot = models.BooleanField(default=False)
    billing_anchor_day = models.PositiveSmallIntegerField(null=True, blank=True)
    billing_anchor_month = models.PositiveSmallIntegerField(null=True, blank=True)
    next_billing_date = models.DateField(null=True, blank=True, db_index=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, related_name='created_subscriptions', on_delete=models.SET_NULL)
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
        return self.number or f'Subscription {self.pk}'


class SubscriptionLine(models.Model):
    subscription = models.ForeignKey(Subscription, related_name='lines', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', related_name='subscription_lines', on_delete=models.PROTECT)
    variant = models.ForeignKey('products.ProductVariant', null=True, blank=True, on_delete=models.PROTECT)
    product_name_snapshot = models.CharField(max_length=200)
    variant_name_snapshot = models.CharField(max_length=200, blank=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    gross_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_rate_snapshot = models.DecimalField(max_digits=7, decimal_places=4, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']


class SubscriptionEvent(models.Model):
    subscription = models.ForeignKey(Subscription, related_name='events', on_delete=models.CASCADE)
    action = models.CharField(max_length=24)
    from_status = models.CharField(max_length=16, choices=Subscription.Status.choices, blank=True)
    to_status = models.CharField(max_length=16, choices=Subscription.Status.choices)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    reason = models.TextField(blank=True)
    effective_on = models.DateField(default=timezone.localdate, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['effective_on', 'created_at', 'id']
        indexes = [models.Index(fields=['subscription', 'effective_on'])]


class BillingAttempt(models.Model):
    class Result(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCEEDED = 'SUCCEEDED', 'Succeeded'
        FAILED = 'FAILED', 'Failed'
        SKIPPED = 'SKIPPED', 'Skipped'

    subscription = models.ForeignKey(Subscription, related_name='billing_attempts', on_delete=models.CASCADE)
    period_start = models.DateField()
    period_end = models.DateField()
    result = models.CharField(max_length=10, choices=Result.choices, default=Result.PENDING)
    attempt_count = models.PositiveIntegerField(default=0)
    invoice_id = models.UUIDField(null=True, blank=True, unique=True)
    skip_reason = models.CharField(max_length=120, blank=True)
    last_error = models.TextField(blank=True)
    attempted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['subscription', 'period_start'], name='uniq_billing_subscription_period')]
        ordering = ['period_start']
