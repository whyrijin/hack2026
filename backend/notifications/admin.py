from django.contrib import admin

from .models import EmailOutbox


@admin.register(EmailOutbox)
class EmailOutboxAdmin(admin.ModelAdmin):
    list_display = ("id", "template", "recipient", "status", "attempts", "created_at", "sent_at")
    list_filter = ("status", "template")
    search_fields = ("recipient", "dedupe_key")
    readonly_fields = (
        "id", "template", "recipient", "context", "dedupe_key", "status", "created_at",
        "sending_at", "sent_at", "attempts", "last_error",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
