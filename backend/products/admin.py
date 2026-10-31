from django.contrib import admin

from .models import Product, ProductVariant, TaxRule


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "sales_price", "is_active", "updated_at")
    list_filter = ("type", "is_active", "taxes")
    search_fields = ("name", "notes")
    filter_horizontal = ("taxes",)
    inlines = (ProductVariantInline,)


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("product", "attribute_label", "option_value", "price_adjustment", "is_active")
    list_filter = ("is_active", "product")
    search_fields = ("product__name", "attribute_label", "option_value")


@admin.register(TaxRule)
class TaxRuleAdmin(admin.ModelAdmin):
    list_display = ("name", "percentage_rate", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)
