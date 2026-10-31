from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("billing", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="invoiceline",
            name="source_id",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
    ]
