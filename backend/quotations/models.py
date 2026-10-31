from django.core.validators import MinValueValidator
from django.db import models


class QuoteTemplate(models.Model):
    name = models.CharField(max_length=160, unique=True)
    plan = models.ForeignKey('plans.Plan', on_delete=models.PROTECT, related_name='quote_templates')
    validity_days = models.PositiveSmallIntegerField(default=14, validators=[MinValueValidator(1)])
    payment_term = models.ForeignKey('plans.PaymentTerm', null=True, blank=True, on_delete=models.SET_NULL, related_name='quote_templates')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def active(self):
        return self.is_active

    @property
    def default_lines(self):
        return [
            {
                'product_id': line.product_id,
                'variant_id': line.variant_id,
                'quantity': line.quantity,
            }
            for line in self.lines.select_related('product', 'variant').order_by('position')
        ]

    def __str__(self):
        return self.name


class TemplateLine(models.Model):
    template = models.ForeignKey(QuoteTemplate, related_name='lines', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='quote_template_lines')
    variant = models.ForeignKey('products.ProductVariant', null=True, blank=True, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['position', 'id']

    def __str__(self):
        return f'{self.template.name}: {self.product.name} × {self.quantity}'
