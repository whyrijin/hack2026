"""Application service for creating idempotent email outbox records."""

import json
import re
from collections.abc import Mapping
from dataclasses import dataclass
from uuid import UUID

from django.db import transaction
from django.core.validators import validate_email

from .constants import REGISTERED_EMAIL_TEMPLATES
from .models import EmailOutbox

_TEMPLATE_KEY = re.compile(r"^[a-z][a-z0-9_]{0,99}$")


class EmailQueueError(Exception):
    """Base class for email queue errors."""


class EmailDedupeConflict(EmailQueueError):
    """A dedupe key was reused for a different email payload."""


class InvalidEmailTemplate(EmailQueueError):
    """Template keys must be simple registered identifiers."""


@dataclass(frozen=True)
class EmailQueueResult:
    email_id: UUID
    created: bool


def queue_email(
    template: str,
    recipient: str,
    context: Mapping[str, object],
    dedupe_key: str,
) -> EmailQueueResult:
    """Persist one email and dispatch it after the surrounding transaction commits."""
    template = str(template).strip()
    recipient = str(recipient).strip()
    dedupe_key = str(dedupe_key).strip()
    if not _TEMPLATE_KEY.fullmatch(template) or template not in REGISTERED_EMAIL_TEMPLATES:
        raise InvalidEmailTemplate(f"Unknown email template: {template!r}.")
    if not recipient or not dedupe_key:
        raise ValueError("recipient and dedupe_key are required.")
    if not isinstance(context, Mapping):
        raise TypeError("context must be a JSON object.")
    validate_email(recipient)
    try:
        normalized_context = json.loads(json.dumps(dict(context), sort_keys=True, separators=(",", ":")))
    except (TypeError, ValueError) as exc:
        raise TypeError("context must be JSON-serializable.") from exc

    with transaction.atomic():
        email, created = EmailOutbox.objects.get_or_create(
            dedupe_key=dedupe_key,
            defaults={
                "template": template,
                "recipient": recipient,
                "context": normalized_context,
            },
        )
        if not created and (
            email.template != template
            or email.recipient != recipient
            or email.context != normalized_context
        ):
            raise EmailDedupeConflict("dedupe_key already belongs to a different email payload.")
        if created:
            from .tasks import deliver_email

            transaction.on_commit(
                lambda email_id=str(email.pk): deliver_email.delay(email_id),
                robust=True,
            )

    return EmailQueueResult(email_id=email.pk, created=created)
