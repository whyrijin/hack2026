from django.contrib import admin


from django.contrib import admin
from .models import QuoteTemplate, TemplateLine


class TemplateLineInline(admin.TabularInline):
    model = TemplateLine
    extra = 0


@admin.register(QuoteTemplate)
class QuoteTemplateAdmin(admin.ModelAdmin):
    list_display = ("title", "associated_plan", "validity_days", "is_active")
    list_filter = ("is_active",)
    search_fields = ("title",)
    inlines = [TemplateLineInline]


@admin.register(TemplateLine)
class TemplateLineAdmin(admin.ModelAdmin):
    list_display = ("template", "product", "variant", "quantity", "sort_order")
    search_fields = ("template__title", "product__name")