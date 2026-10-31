# Generated manually because Django is not installed in the authoring environment.
import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="PaymentTerm",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=64, unique=True)),
                ("days_until_due", models.PositiveIntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)])),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ("days_until_due", "name")},
        ),
        migrations.CreateModel(
            name="Plan",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(db_index=True, max_length=255, unique=True)),
                ("base_price", models.DecimalField(decimal_places=2, default=0, max_digits=10, validators=[django.core.validators.MinValueValidator(0)])),
                (
                    "billing_cadence",
                    models.CharField(
                        choices=[("daily", "Daily"), ("weekly", "Weekly"), ("monthly", "Monthly"), ("yearly", "Yearly")],
                        default="monthly",
                        max_length=16,
                    ),
                ),
                ("minimum_quantity", models.PositiveIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)])),
                ("availability_start_date", models.DateField(default=django.utils.timezone.localdate)),
                ("availability_end_date", models.DateField(blank=True, null=True)),
                ("auto_close", models.BooleanField(default=False)),
                ("allow_early_closure", models.BooleanField(default=True)),
                ("allow_pause", models.BooleanField(default=True)),
                ("allow_renewal", models.BooleanField(default=True)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("payment_term", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="plans", to="plans.paymentterm")),
                ("taxes", models.ManyToManyField(blank=True, related_name="plans", to="products.taxrule")),
            ],
            options={"ordering": ("name",)},
        ),
        migrations.AddConstraint(
            model_name="plan",
            constraint=models.CheckConstraint(check=models.Q(base_price__gte=0), name="plan_base_price_nonneg_ck"),
        ),
        migrations.AddConstraint(
            model_name="plan",
            constraint=models.CheckConstraint(check=models.Q(minimum_quantity__gte=1), name="plan_min_quantity_ck"),
        ),
        migrations.AddConstraint(
            model_name="plan",
            constraint=models.CheckConstraint(
                check=models.Q(availability_end_date__isnull=True)
                | models.Q(availability_end_date__gte=models.F("availability_start_date")),
                name="plan_availability_window_ck",
            ),
        ),
    ]
