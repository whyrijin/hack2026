from django.contrib import admin

from .models import PaymentTerm, Plan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'billing_cadence', 'base_price', 'minimum_quantity', 'is_active']
    list_filter = ['billing_cadence', 'is_active']
    search_fields = ['name']


@admin.register(PaymentTerm)
class PaymentTermAdmin(admin.ModelAdmin):
    list_display = ['name', 'days_until_due', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
