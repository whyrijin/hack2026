from django.contrib import admin

from .models import DocumentJob, Invoice, InvoiceLine


class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 0
    can_delete = False
    readonly_fields = tuple(field.name for field in InvoiceLine._meta.fields)

    def has_add_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "subscription", "period_start", "period_end", "status", "total", "currency")
    list_filter = ("status", "currency")
    inlines = (InvoiceLineInline,)
    readonly_fields = (
        "id", "invoice_number", "subscription", "period_start", "period_end", "customer_id_snapshot",
        "customer_snapshot", "discount_snapshot", "status", "currency", "subtotal",
        "discount_total", "tax_total", "total", "due_date", "confirmed_at", "paid_at", "cancelled_at",
        "created_at", "updated_at",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(InvoiceLine)
class InvoiceLineAdmin(admin.ModelAdmin):
    list_display = ("invoice", "line_number", "description", "quantity", "total_amount")
    search_fields = ("description",)
    readonly_fields = tuple(field.name for field in InvoiceLine._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(DocumentJob)
class DocumentJobAdmin(admin.ModelAdmin):
    list_display = ("id", "invoice", "kind", "status", "attempts", "created_at")
    list_filter = ("kind", "status")
    search_fields = ("invoice__invoice_number", "dedupe_key")
    readonly_fields = tuple(field.name for field in DocumentJob._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
