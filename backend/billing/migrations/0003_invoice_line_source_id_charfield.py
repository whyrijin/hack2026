from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("billing", "0002_invoice_unique_cycle_start"),
    ]

    operations = [
        migrations.AlterField(
            model_name="invoiceline",
            name="source_id",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
    ]
