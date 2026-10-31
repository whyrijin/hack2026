from celery import shared_task
from django.utils import timezone

from .services import advance_lifecycle, scan_due_subscriptions


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_jitter=True, max_retries=5)
def run_due_billing_scan(self):
    return scan_due_subscriptions()


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_jitter=True, max_retries=5)
def run_lifecycle_scan(self):
    return advance_lifecycle()
