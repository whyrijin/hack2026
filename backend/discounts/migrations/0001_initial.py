# Generated manually because Django is not installed in the authoring environment.
import uuid

import django.core.validators
import django.db.models.functions.text
from django.db import migrations, models
from django.db.models import F
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="DiscountRule",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("code", models.CharField(blank=True, db_index=True, max_length=64, null=True)),
                ("name", models.CharField(max_length=255)),
                (
                    "discount_type",
                    models.CharField(
                        choices=[("percentage", "Percentage"), ("fixed_amount", "Fixed amount")],
                        default="percentage",
                        max_length=16,
                    ),
                ),
                (
                    "value",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "scope",
                    models.CharField(
                        choices=[("order", "Order"), ("plan", "Plan"), ("lines", "Lines")],
                        default="order",
                        max_length=16,
                    ),
                ),
                (
                    "min_order_amount",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=12,
                        null=True,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "max_discount_cap",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=12,
                        null=True,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                ("valid_from", models.DateTimeField(default=django.utils.timezone.now)),
                ("valid_to", models.DateTimeField(blank=True, null=True)),
                ("max_uses", models.PositiveIntegerField(blank=True, null=True)),
                ("times_reserved", models.PositiveIntegerField(default=0)),
                ("times_used", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ("name",)},
        ),
        migrations.CreateModel(
            name="DiscountReservation",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("quote_id", models.UUIDField()),
                (
                    "status",
                    models.CharField(
                        choices=[("reserved", "Reserved"), ("consumed", "Consumed"), ("released", "Released")],
                        default="reserved",
                        max_length=16,
                    ),
                ),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                ("consumed_at", models.DateTimeField(blank=True, null=True)),
                ("released_at", models.DateTimeField(blank=True, null=True)),
                ("release_reason", models.CharField(blank=True, max_length=255)),
                ("invoice_id", models.UUIDField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "discount_rule",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="reservations",
                        to="discounts.discountrule",
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="discountrule",
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower("code"),
                condition=models.Q(code__isnull=False),
                name="discount_rule_code_ci_uniq",
            ),
        ),
        migrations.AddConstraint(
            model_name="discountrule",
            constraint=models.CheckConstraint(
                check=models.Q(valid_to__isnull=True) | models.Q(valid_to__gte=F("valid_from")),
                name="discount_rule_valid_window",
            ),
        ),
        migrations.AddConstraint(
            model_name="discountrule",
            constraint=models.CheckConstraint(
                check=models.Q(max_uses__isnull=True) | models.Q(times_used__lte=F("max_uses") - F("times_reserved")),
                name="discount_quota_ck",
            ),
        ),
        migrations.AddConstraint(
            model_name="discountrule",
            constraint=models.CheckConstraint(
                check=~models.Q(discount_type="percentage") | models.Q(value__lte=100),
                name="discount_pct_max_ck",
            ),
        ),
        migrations.AddConstraint(
            model_name="discountrule",
            constraint=models.CheckConstraint(check=models.Q(value__gte=0), name="discount_value_nonneg_ck"),
        ),
        migrations.AddConstraint(
            model_name="discountrule",
            constraint=models.CheckConstraint(
                check=models.Q(min_order_amount__isnull=True) | models.Q(min_order_amount__gte=0),
                name="discount_min_order_nonneg_ck",
            ),
        ),
        migrations.AddConstraint(
            model_name="discountrule",
            constraint=models.CheckConstraint(
                check=models.Q(max_discount_cap__isnull=True) | models.Q(max_discount_cap__gte=0),
                name="discount_cap_nonneg_ck",
            ),
        ),
        migrations.AddConstraint(
            model_name="discountreservation",
            constraint=models.UniqueConstraint(
                fields=("discount_rule", "quote_id"),
                name="discount_resv_quote_uq",
            ),
        ),
        migrations.AddIndex(
            model_name="discountreservation",
            index=models.Index(fields=("status", "expires_at"), name="discount_resv_expiry_idx"),
        ),
    ]
