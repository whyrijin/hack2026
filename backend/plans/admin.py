from django.contrib import admin

from django.contrib import admin
from .models import Plan, PaymentTerm


@admin.register(PaymentTerm)
class PaymentTermAdmin(admin.ModelAdmin):
    list_display = ("name", "days_until_due", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("name", "billing_cadence", "base_price", "is_active")
    list_filter = ("billing_cadence", "is_active")
    search_fields = ("name",)
