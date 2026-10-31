# Generated manually because Django is not installed in the authoring environment.
import uuid

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("subscriptions", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Invoice",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("period_start", models.DateField()),
                ("period_end", models.DateField()),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("Draft", "Draft"),
                            ("Confirmed", "Confirmed"),
                            ("Paid", "Paid"),
                            ("Cancelled", "Cancelled"),
                        ],
                        default="Draft",
                        max_length=16,
                    ),
                ),
                ("currency", models.CharField(default="INR", max_length=3)),
                (
                    "subtotal",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "discount_total",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "tax_total",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "total",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                ("due_date", models.DateField(blank=True, null=True)),
                ("confirmed_at", models.DateTimeField(blank=True, null=True)),
                ("paid_at", models.DateTimeField(blank=True, null=True)),
                ("cancelled_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "subscription",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="invoices",
                        to="subscriptions.subscription",
                    ),
                ),
            ],
            options={"ordering": ("-created_at",)},
        ),
        migrations.CreateModel(
            name="InvoiceLine",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("line_number", models.PositiveIntegerField()),
                ("description", models.CharField(max_length=255)),
                (
                    "quantity",
                    models.DecimalField(
                        decimal_places=3,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "unit_price",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "gross_amount",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "discount_amount",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "taxable_amount",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                ("tax_rate", models.DecimalField(blank=True, decimal_places=4, max_digits=7, null=True)),
                (
                    "tax_amount",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "total_amount",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                ("source_type", models.CharField(blank=True, max_length=32)),
                ("source_id", models.UUIDField(blank=True, null=True)),
                (
                    "invoice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="lines",
                        to="billing.invoice",
                    ),
                ),
            ],
            options={"ordering": ("line_number",)},
        ),
        migrations.AddConstraint(
            model_name="invoice",
            constraint=models.UniqueConstraint(
                fields=("subscription", "period_start", "period_end"),
                name="inv_sub_period_uq",
            ),
        ),
        migrations.AddConstraint(
            model_name="invoice",
            constraint=models.CheckConstraint(
                check=models.Q(period_end__gt=models.F("period_start")),
                name="billing_invoice_period_valid",
            ),
        ),
        migrations.AddConstraint(
            model_name="invoice",
            constraint=models.CheckConstraint(
                check=models.Q(subtotal__gte=0, discount_total__gte=0, tax_total__gte=0, total__gte=0),
                name="inv_totals_nonneg_ck",
            ),
        ),
        migrations.AddConstraint(
            model_name="invoice",
            constraint=models.CheckConstraint(
                check=models.Q(discount_total__lte=models.F("subtotal")),
                name="inv_discount_lte_subtotal_ck",
            ),
        ),
        migrations.AddConstraint(
            model_name="invoiceline",
            constraint=models.UniqueConstraint(
                fields=("invoice", "line_number"),
                name="inv_line_num_uq",
            ),
        ),
        migrations.AddConstraint(
            model_name="invoiceline",
            constraint=models.CheckConstraint(
                check=models.Q(quantity__gt=0),
                name="billing_line_quantity_positive",
            ),
        ),
        migrations.AddConstraint(
            model_name="invoiceline",
            constraint=models.CheckConstraint(
                check=models.Q(
                    unit_price__gte=0,
                    gross_amount__gte=0,
                    discount_amount__gte=0,
                    taxable_amount__gte=0,
                    tax_amount__gte=0,
                    total_amount__gte=0,
                ),
                name="inv_line_amounts_ck",
            ),
        ),
        migrations.AddConstraint(
            model_name="invoiceline",
            constraint=models.CheckConstraint(
                check=models.Q(discount_amount__lte=models.F("gross_amount")),
                name="inv_line_discount_lte_gross_ck",
            ),
        ),
    ]
