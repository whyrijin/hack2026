from django.contrib import admin

from .models import Subscription, SubscriptionLine


class SubscriptionLineInline(admin.TabularInline):
    model = SubscriptionLine
    extra = 0
    filter_horizontal = ("taxes",)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "status", "plan", "customer_id", "created_at", "updated_at")
    list_filter = ("status",)
    inlines = (SubscriptionLineInline,)
