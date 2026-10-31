# Generated manually because Django is not installed in the authoring environment.
import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="EmailOutbox",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("template", models.CharField(max_length=100)),
                ("recipient", models.EmailField(max_length=254)),
                ("context", models.JSONField(default=dict)),
                ("dedupe_key", models.CharField(max_length=200, unique=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("queued", "Queued"),
                            ("sending", "Sending"),
                            ("sent", "Sent"),
                            ("failed", "Failed"),
                        ],
                        db_index=True,
                        default="queued",
                        max_length=16,
                    ),
                ),
                ("attempts", models.PositiveIntegerField(default=0)),
                ("last_error", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("sending_at", models.DateTimeField(blank=True, null=True)),
                ("sent_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={"ordering": ("created_at",)},
        ),
    ]
