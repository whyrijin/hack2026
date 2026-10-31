# Generated manually because Django is not installed in the authoring environment.
import uuid

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


def normalize_subscription_statuses(apps, schema_editor):
    Subscription = apps.get_model("subscriptions", "Subscription")
    Subscription.objects.filter(status="active").update(status="Active")
    Subscription.objects.filter(status="paused").update(status="Closed")
    Subscription.objects.filter(status="cancelled").update(status="Closed")
    Subscription.objects.filter(status="expired").update(status="Closed")


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0001_initial"),
        ("plans", "0001_initial"),
        ("subscriptions", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="subscription",
            name="customer_id",
            field=models.PositiveBigIntegerField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name="subscription",
            name="plan_base_price_snapshot",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name="subscription",
            name="plan_tax_rate_snapshot",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name="subscription",
            name="plan",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="subscriptions",
                to="plans.plan",
            ),
        ),
        migrations.CreateModel(
            name="SubscriptionLine",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("quantity", models.PositiveIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("product_name_snapshot", models.CharField(blank=True, max_length=255)),
                ("unit_sales_price", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("variant_adjustment", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("effective_unit_price", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("line_subtotal", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("discount_amount", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("line_net_amount", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("tax_rate", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ("tax_amount", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("final_line_total", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("product", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="subscription_lines", to="products.product")),
                ("subscription", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lines", to="subscriptions.subscription")),
                ("variant", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="subscription_lines", to="products.productvariant")),
                ("taxes", models.ManyToManyField(blank=True, related_name="subscription_lines", to="products.taxrule")),
            ],
            options={"ordering": ("sort_order", "id")},
        ),
        migrations.AddConstraint(
            model_name="subscriptionline",
            constraint=models.CheckConstraint(check=models.Q(quantity__gte=1), name="subscription_line_quantity_ck"),
        ),
        migrations.RunPython(normalize_subscription_statuses, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="subscription",
            name="status",
            field=models.CharField(
                choices=[
                    ("Draft", "Draft"),
                    ("Quotation", "Quotation"),
                    ("Confirmed", "Confirmed"),
                    ("Active", "Active"),
                    ("Closed", "Closed"),
                ],
                db_index=True,
                default="Draft",
                max_length=16,
            ),
        ),
    ]
