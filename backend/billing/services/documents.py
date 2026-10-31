"""Durable private PDF requests, deduplicated by invoice content."""

import hashlib
import json

from django.db import transaction

from billing.models import DocumentJob
from billing.serializers import serialize_invoice


def document_payload(invoice):
    payload = serialize_invoice(invoice)
    # UI state changes with the clock and does not change the issued document.
    payload.pop("allowed_actions")
    payload.pop("is_overdue")
    return payload


def document_key(invoice):
    content = json.dumps(document_payload(invoice), sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(content.encode()).hexdigest()
    return f"invoice:{invoice.pk}:pdf:{digest}"


def queue_invoice_pdf(invoice, *, retry_failed=False):
    with transaction.atomic():
        job, created = DocumentJob.objects.get_or_create(
            dedupe_key=document_key(invoice), defaults={"invoice": invoice},
        )
        dispatch = created
        if retry_failed and job.status == DocumentJob.Status.FAILED:
            job = DocumentJob.objects.select_for_update().get(pk=job.pk)
            if job.status == DocumentJob.Status.FAILED:
                job.status = DocumentJob.Status.QUEUED
                job.attempts = 0
                job.last_error = ""
                job.started_at = None
                job.finished_at = None
                job.save(update_fields=("status", "attempts", "last_error", "started_at", "finished_at"))
                dispatch = True
        if dispatch:
            from billing.tasks import render_invoice_pdf

            transaction.on_commit(lambda: render_invoice_pdf.delay(str(job.pk)), robust=True)
    return job
