from django.core.validators import MinValueValidator
from django.db import models



from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


class QuoteTemplate(models.Model):
    """Reusable quotation blueprint for creating subscriptions and quotes."""

    name = models.CharField(max_length=160, unique=True)

    plan = models.ForeignKey(
        "plans.Plan",
        on_delete=models.PROTECT,
        related_name="quote_templates",
    )

    validity_days = models.PositiveSmallIntegerField(
        default=14,
        validators=[MinValueValidator(1)],
    )

    payment_term = models.ForeignKey(
        "plans.PaymentTerm",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quote_templates",
    )

    terms_and_conditions = models.TextField(
        blank=True,
        default="",
    )

    is_active = models.BooleanField(default=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Compatibility with the existing admin configuration.
    @property
    def title(self):
        return self.name

    @property
    def associated_plan(self):
        return self.plan

    @property
    def active(self):
        return self.is_active

    @property
    def default_lines(self):
        return [
            {
                "product_id": line.product_id,
                "variant_id": line.variant_id,
                "quantity": line.quantity,
            }
            for line in self.lines.all()
        ]

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class TemplateLine(models.Model):
    """Product line included in a quotation template."""

    template = models.ForeignKey(
        QuoteTemplate,
        on_delete=models.CASCADE,
        related_name="lines",
    )

    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="quote_template_lines",
    )

    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )

    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
    )

    taxes = models.ManyToManyField(
        "products.TaxRule",
        blank=True,
        related_name="quote_template_lines",
    )

    position = models.PositiveSmallIntegerField(default=0)

    # Compatibility with the existing admin configuration.
    @property
    def sort_order(self):
        return self.position

    def clean(self):
        super().clean()

        if (
            self.variant_id
            and self.product_id
            and self.variant.product_id != self.product_id
        ):
            raise ValidationError({
                "variant": (
                    "The selected variant does not belong to this product."
                )
            })

    def __str__(self):
        return (
            f"{self.template.name}: "
            f"{self.product.name} × {self.quantity}"
        )

    class Meta:
        ordering = ["position", "id"]
