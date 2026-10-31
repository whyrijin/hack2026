from django.contrib import admin

from .models import BillingAttempt, Subscription, SubscriptionEvent, SubscriptionLine


class SubscriptionLineInline(admin.TabularInline):
    model = SubscriptionLine
    extra = 0
    readonly_fields = ['product_name_snapshot', 'variant_name_snapshot', 'unit_price', 'gross_amount', 'discount_amount', 'tax_amount', 'net_amount']


class SubscriptionEventInline(admin.TabularInline):
    model = SubscriptionEvent
    extra = 0
    readonly_fields = ['action', 'from_status', 'to_status', 'actor', 'reason', 'effective_on', 'created_at']
    can_delete = False


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['number', 'customer', 'plan', 'status', 'start_date', 'next_billing_date']
    list_filter = ['status', 'cadence']
    search_fields = ['number', 'customer__name', 'customer__email']
    readonly_fields = ['number', 'status', 'next_billing_date', 'created_at', 'updated_at']
    inlines = [SubscriptionLineInline, SubscriptionEventInline]


@admin.register(BillingAttempt)
class BillingAttemptAdmin(admin.ModelAdmin):
    list_display = ['subscription', 'period_start', 'period_end', 'result', 'attempt_count', 'invoice_id']
    list_filter = ['result']
    readonly_fields = [field.name for field in BillingAttempt._meta.fields]
