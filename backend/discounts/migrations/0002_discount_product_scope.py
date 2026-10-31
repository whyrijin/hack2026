from django.core.validators import MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("discounts", "0001_initial"),
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="discountrule",
            name="minimum_quantity",
            field=models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)]),
        ),
        migrations.AddField(
            model_name="discountrule",
            name="products",
            field=models.ManyToManyField(blank=True, related_name="discount_rules", to="products.product"),
        ),
        migrations.AddConstraint(
            model_name="discountrule",
            constraint=models.CheckConstraint(check=models.Q(minimum_quantity__gte=1), name="discount_min_quantity_ck"),
        ),
    ]
