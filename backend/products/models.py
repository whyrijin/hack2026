from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class TaxRule(models.Model):
    name = models.CharField(max_length=64, unique=True)
    percentage_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00")), MaxValueValidator(Decimal("100.00"))],
    )
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        constraints = [
            models.CheckConstraint(check=models.Q(percentage_rate__gte=0, percentage_rate__lte=100), name="tax_rate_range_ck"),
        ]

    def __str__(self):
        return f"{self.name} ({self.percentage_rate}%)"


class Product(models.Model):
    class ProductType(models.TextChoices):
        SERVICE = "service", "Service"
        CONSUMABLE = "consumable", "Consumable"
        ADDON = "addon", "Add-on"

    name = models.CharField(max_length=255, db_index=True)
    type = models.CharField(max_length=32, choices=ProductType.choices, default=ProductType.SERVICE)
    sales_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    notes = models.TextField(blank=True, default="")
    taxes = models.ManyToManyField(TaxRule, blank=True, related_name="products")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        constraints = [
            models.CheckConstraint(check=models.Q(sales_price__gte=0), name="product_sales_price_nonneg_ck"),
            models.CheckConstraint(check=models.Q(cost_price__gte=0), name="product_cost_price_nonneg_ck"),
        ]

    def __str__(self):
        return self.name


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    attribute_label = models.CharField(max_length=64)
    option_value = models.CharField(max_length=64)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("product", "attribute_label", "option_value"),
                name="product_variant_option_uq",
            ),
        ]
        ordering = ("product__name", "attribute_label", "option_value")

    def clean(self):
        super().clean()
        if self.product_id:
            product = self.product
            if product.sales_price + self.price_adjustment < Decimal("0.00"):
                raise ValidationError({"price_adjustment": "Effective variant price cannot be negative."})

    @property
    def effective_unit_price(self):
        return self.product.sales_price + self.price_adjustment

    def __str__(self):
        return f"{self.product}: {self.attribute_label} {self.option_value}"
