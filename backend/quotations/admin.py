from django.contrib import admin

from .models import QuoteTemplate, TemplateLine


class TemplateLineInline(admin.TabularInline):
    model = TemplateLine
    extra = 0


@admin.register(QuoteTemplate)
class QuoteTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan', 'validity_days', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'plan__name']
    inlines = [TemplateLineInline]
