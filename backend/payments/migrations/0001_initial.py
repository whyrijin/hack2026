# Generated manually because Django is not installed in the authoring environment.
import uuid
from decimal import Decimal

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("billing", "0003_h2_models"),
    ]

    operations = [
        migrations.CreateModel(
            name="Payment",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("method", models.CharField(max_length=40)),
                (
                    "amount",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(Decimal("0.01"))],
                    ),
                ),
                ("currency", models.CharField(max_length=3)),
                ("received_at", models.DateTimeField()),
                ("note", models.TextField(blank=True)),
                ("reference", models.CharField(blank=True, max_length=128)),
                ("idempotency_key", models.CharField(max_length=128, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "invoice",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="payments",
                        to="billing.invoice",
                    ),
                ),
            ],
            options={"ordering": ("-received_at",)},
        ),
        migrations.AddConstraint(
            model_name="payment",
            constraint=models.CheckConstraint(check=models.Q(amount__gt=0), name="payment_amount_positive_ck"),
        ),
    ]
