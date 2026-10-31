from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class TaxRule(models.Model):
    name = models.CharField(max_length=64, unique=True)
    percentage_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    class Type(models.TextChoices):
        SERVICE = 'service', 'Service'
        CONSUMABLE = 'consumable', 'Consumable'
        ADDON = 'addon', 'Add-on'

    name = models.CharField(max_length=255, db_index=True)
    type = models.CharField(max_length=32, choices=Type.choices, default=Type.SERVICE)
    sales_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    notes = models.TextField(blank=True)
    taxes = models.ManyToManyField(TaxRule, related_name='products', blank=True)
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


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    attribute_label = models.CharField(max_length=64)
    option_value = models.CharField(max_length=64)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['product', 'attribute_label', 'option_value'], name='unique_product_variant_option')]

    @property
    def attribute(self):
        return self.attribute_label

    @property
    def value(self):
        return self.option_value

    @property
    def active(self):
        return self.is_active

    def clean(self):
        super().clean()
        if self.product_id:
            effective_price = self.product.sales_price + self.price_adjustment
            if effective_price < Decimal('0.00'):
                from django.core.exceptions import ValidationError

                raise ValidationError({'price_adjustment': 'The effective product price cannot be negative.'})

    def __str__(self):
        return f'{self.product}: {self.attribute_label} {self.option_value}'
