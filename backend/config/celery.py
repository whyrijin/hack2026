"""Celery application shared by the worker and the single Beat scheduler."""
import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
app.conf.update(
    broker_connection_retry_on_startup=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    beat_schedule={
        **app.conf.beat_schedule,
        'daily-subscription-due-scan': {
            'task': 'billing_jobs.tasks.run_due_billing_scan',
            'schedule': crontab(minute=0, hour=1),
        },
        'future-activation-and-expiry-scan': {
            'task': 'billing_jobs.tasks.run_lifecycle_scan',
            'schedule': crontab(minute='*/15'),
        },
    },
)
