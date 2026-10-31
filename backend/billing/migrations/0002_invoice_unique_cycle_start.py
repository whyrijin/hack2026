from django.db import migrations, models
from config import migration_compat


class Migration(migrations.Migration):
    dependencies = [
        ("billing", "0001_initial"),
        ("subscriptions", "0003_alter_subscription_cadence_and_more"),
    ]

    operations = [
        migration_compat.RemoveConstraint(
            model_name="invoice",
            name="inv_sub_period_uq",
        ),
        migrations.AddConstraint(
            model_name="invoice",
            constraint=models.UniqueConstraint(
                fields=("subscription", "period_start"),
                name="inv_sub_period_uq",
            ),
        ),
    ]
