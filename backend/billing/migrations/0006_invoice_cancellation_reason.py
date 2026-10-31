from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("billing", "0005_alter_invoicenumbersequence_options")]

    operations = [
        migrations.AddField(
            model_name="invoice",
            name="cancellation_reason",
            field=models.TextField(blank=True),
        ),
    ]
