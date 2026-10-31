from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models



from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class TaxRule(models.Model):
    """Additive percentage tax rule applied to products and plans."""

    name = models.CharField(max_length=64, unique=True)

    percentage_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
            MaxValueValidator(Decimal("100.00")),
        ],
    )

    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.percentage_rate}%)"

    class Meta:
        ordering = ["name"]
        verbose_name = "Tax Rule"
        verbose_name_plural = "Tax Rules"


class Product(models.Model):
    """Base sellable product, software tier, or add-on service."""

    class Type(models.TextChoices):
        SERVICE = "service", "Service"
        CONSUMABLE = "consumable", "Consumable"
        ADDON = "addon", "Add-on"

    # Backward-compatible enum name.
    ProductType = Type

    name = models.CharField(max_length=255, db_index=True)

    type = models.CharField(
        max_length=32,
        choices=Type.choices,
        default=Type.SERVICE,
    )

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
        help_text="Internal cost price. Never expose through customer APIs.",
    )

    notes = models.TextField(
        blank=True,
        default="",
        help_text="Internal administrative notes. Hidden from customers.",
    )

    taxes = models.ManyToManyField(
        TaxRule,
        blank=True,
        related_name="products",
    )

    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def sale_price(self):
        return self.sales_price

    @property
    def active(self):
        return self.is_active

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class ProductVariant(models.Model):
    """Variant option for a product, such as brand, region, or storage size."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
    )

    attribute_label = models.CharField(max_length=64)
    option_value = models.CharField(max_length=64)

    price_adjustment = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Can be positive, zero, or negative.",
    )

    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def attribute(self):
        return self.attribute_label

    @property
    def value(self):
        return self.option_value

    @property
    def active(self):
        return self.is_active

    @property
    def effective_price(self):
        return self.product.sales_price + self.price_adjustment

    def clean(self):
        super().clean()

        if self.product_id:
            if self.effective_price < Decimal("0.00"):
                raise ValidationError({
                    "price_adjustment": (
                        "The effective unit price cannot be negative. "
                        "Product sales price plus variant adjustment "
                        "must be greater than or equal to zero."
                    )
                })

    def __str__(self):
        return (
            f"{self.product.name} - "
            f"{self.attribute_label}: {self.option_value}"
        )

    class Meta:
        ordering = ["product", "attribute_label", "option_value"]
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product",
                    "attribute_label",
                    "option_value",
                ],
                name="unique_product_variant_option",
            )
        ]
