from django.contrib import admin

from .models import DiscountReservation, DiscountRule


@admin.register(DiscountRule)
class DiscountRuleAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "discount_type", "value", "is_active", "times_used", "times_reserved")
    list_filter = ("is_active", "discount_type", "scope")
    search_fields = ("name", "code")
    readonly_fields = ("times_used", "times_reserved", "created_at", "updated_at")
    filter_horizontal = ("products",)


@admin.register(DiscountReservation)
class DiscountReservationAdmin(admin.ModelAdmin):
    list_display = ("discount_rule", "quote_id", "status", "expires_at", "created_at")
    list_filter = ("status",)
    search_fields = ("discount_rule__code", "discount_rule__name")
    readonly_fields = tuple(field.name for field in DiscountReservation._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
