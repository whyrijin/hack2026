# Generated manually because Django is not installed in the authoring environment.
import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Subscription",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("active", "Active"),
                            ("paused", "Paused"),
                            ("cancelled", "Cancelled"),
                            ("expired", "Expired"),
                        ],
                        db_index=True,
                        default="active",
                        max_length=16,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
