from django.db import models


from django.core.validators import MinValueValidator
from django.db import models


class QuoteTemplate(models.Model):
    """
    Reusable quotation blueprint for creating subscriptions and quotes.
    """

    title = models.CharField(
        max_length=255,
        unique=True,
    )

    associated_plan = models.ForeignKey(
        "plans.Plan",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quote_templates",
    )

    validity_days = models.PositiveIntegerField(
        default=30,
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

    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["title"]


class TemplateLine(models.Model):
    """
    Product line included in a quotation template.
    """

    template = models.ForeignKey(
        QuoteTemplate,
        on_delete=models.CASCADE,
        related_name="lines",
    )

    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="+",
    )

    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="+",
    )

    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
    )

    taxes = models.ManyToManyField(
        "products.TaxRule",
        blank=True,
        related_name="+",
    )

    sort_order = models.PositiveIntegerField(default=0)

    def clean(self):
        from django.core.exceptions import ValidationError

        super().clean()

        if (
            self.variant_id
            and self.product_id
            and self.variant.product_id != self.product_id
        ):
            raise ValidationError({
                "variant": "The selected variant does not belong to this product."
            })

    def __str__(self):
        return f"{self.template.title} - {self.product.name}"

    class Meta:
        ordering = ["sort_order", "id"]

