from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ("billing", "0003_h2_models"),
        ("billing", "0003_invoice_line_source_id_charfield"),
    ]
    operations = []
