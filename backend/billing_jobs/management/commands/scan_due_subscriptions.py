import json
from datetime import date

from django.core.management.base import BaseCommand

from billing_jobs.services import scan_due_subscriptions


class Command(BaseCommand):
    help = 'Run the same due-subscription billing scan scheduled by Celery Beat.'

    def add_arguments(self, parser):
        parser.add_argument('--date', help='Optional ISO date (YYYY-MM-DD) for a deterministic demo scan.')

    def handle(self, *args, **options):
        result = scan_due_subscriptions(today=date.fromisoformat(options['date'])) if options['date'] else scan_due_subscriptions()
        self.stdout.write(json.dumps(result, sort_keys=True))
