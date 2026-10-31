from django.contrib import admin


from django.contrib import admin
from .models import Product, ProductVariant, TaxRule


@admin.register(TaxRule)
class TaxRuleAdmin(admin.ModelAdmin):
    list_display = ("name", "percentage_rate", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "sales_price", "is_active")
    list_filter = ("type", "is_active")
    search_fields = ("name",)
    inlines = [ProductVariantInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("product", "attribute_label", "option_value", "price_adjustment", "is_active")
    list_filter = ("is_active",)
    search_fields = ("product__name", "attribute_label", "option_value")