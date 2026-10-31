import uuid

from django.db import models


class EmailOutbox(models.Model):
    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        SENDING = "sending", "Sending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.CharField(max_length=100)
    recipient = models.EmailField()
    context = models.JSONField(default=dict)
    dedupe_key = models.CharField(max_length=200, unique=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.QUEUED, db_index=True)
    attempts = models.PositiveIntegerField(default=0)
    last_error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sending_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self):
        return f"{self.template} to {self.recipient} ({self.status})"
