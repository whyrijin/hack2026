"""Celery delivery task for the email outbox."""

from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.template import TemplateDoesNotExist
from django.template.loader import render_to_string
from django.utils import timezone

from .constants import REGISTERED_EMAIL_TEMPLATES
from .models import EmailOutbox

MAX_DELIVERY_ATTEMPTS = 6
DELIVERY_LEASE = timedelta(minutes=30)


@shared_task(bind=True, acks_late=True, max_retries=5, name="notifications.deliver_email")
def deliver_email(self, email_id):
    now = timezone.now()
    with transaction.atomic():
        try:
            email = EmailOutbox.objects.select_for_update().get(pk=email_id)
        except EmailOutbox.DoesNotExist:
            return "missing"

        if email.status == EmailOutbox.Status.SENT:
            return "already_sent"
        if email.status == EmailOutbox.Status.SENDING and email.sending_at and email.sending_at > now - DELIVERY_LEASE:
            return "already_processing"

        email.status = EmailOutbox.Status.SENDING
        email.attempts += 1
        email.sending_at = now
        email.last_error = ""
        email.save(update_fields=("status", "attempts", "sending_at", "last_error"))
        attempt = email.attempts
        template = email.template
        recipient = email.recipient
        context = email.context

    error_text = None
    try:
        if template not in REGISTERED_EMAIL_TEMPLATES:
            raise ValueError(f"Unknown email template: {template!r}.")
        subject = render_to_string(f"notifications/email/{template}.subject.txt", context).strip()
        text_body = render_to_string(f"notifications/email/{template}.body.txt", context)
        html_body = None
        try:
            html_body = render_to_string(f"notifications/email/{template}.body.html", context)
        except TemplateDoesNotExist:
            pass

        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            to=[recipient],
        )
        if html_body:
            message.attach_alternative(html_body, "text/html")
        if message.send(fail_silently=False) != 1:
            raise RuntimeError("Email backend did not report a successful delivery.")
    except Exception as exc:
        error_text = f"{type(exc).__name__}: {exc}"[:2000]

    if error_text:
        should_retry = attempt < MAX_DELIVERY_ATTEMPTS
        with transaction.atomic():
            current = EmailOutbox.objects.select_for_update().get(pk=email_id)
            if current.sending_at == now and current.status == EmailOutbox.Status.SENDING:
                current.last_error = error_text
                current.status = EmailOutbox.Status.QUEUED if should_retry else EmailOutbox.Status.FAILED
                current.sending_at = None
                current.save(update_fields=("status", "last_error", "sending_at"))
        if should_retry:
            raise self.retry(exc=RuntimeError(error_text), countdown=min(60 * (2**self.request.retries), 3600))
        raise RuntimeError(error_text)

    with transaction.atomic():
        current = EmailOutbox.objects.select_for_update().get(pk=email_id)
        if current.status == EmailOutbox.Status.SENDING and current.sending_at == now:
            current.status = EmailOutbox.Status.SENT
            current.sent_at = timezone.now()
            current.sending_at = None
            current.last_error = ""
            current.save(update_fields=("status", "sent_at", "sending_at", "last_error"))
    return "sent"


@shared_task(name="notifications.enqueue_pending_emails")
def enqueue_pending_emails():
    """Recover queued outbox rows if a broker or worker was unavailable."""
    stale_before = timezone.now() - DELIVERY_LEASE
    EmailOutbox.objects.filter(
        status=EmailOutbox.Status.SENDING,
        sending_at__lte=stale_before,
        attempts__lt=MAX_DELIVERY_ATTEMPTS,
    ).update(
        status=EmailOutbox.Status.QUEUED,
        sending_at=None,
        last_error="Delivery lease expired; retrying.",
    )
    EmailOutbox.objects.filter(
        status=EmailOutbox.Status.SENDING,
        sending_at__lte=stale_before,
        attempts__gte=MAX_DELIVERY_ATTEMPTS,
    ).update(
        status=EmailOutbox.Status.FAILED,
        sending_at=None,
        last_error="Delivery lease expired after the maximum attempts.",
    )
    queued_ids = EmailOutbox.objects.filter(status=EmailOutbox.Status.QUEUED).values_list("id", flat=True)
    count = 0
    for email_id in queued_ids.iterator():
        deliver_email.delay(str(email_id))
        count += 1
    return count
