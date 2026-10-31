from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "invoice", "method", "amount", "currency", "received_at")
    list_filter = ("method", "currency", "received_at")
    search_fields = ("invoice__invoice_number", "reference", "idempotency_key")
    readonly_fields = tuple(field.name for field in Payment._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
