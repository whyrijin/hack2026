"""Periodic cleanup for expired discount reservations."""

from celery import shared_task
from django.utils import timezone

from .models import DiscountReservation
from .services import DiscountError, DiscountService


@shared_task(name="discounts.expire_reservations")
def expire_discount_reservations():
    expired = DiscountReservation.objects.select_related("discount_rule").filter(
        status=DiscountReservation.Status.RESERVED,
        expires_at__lte=timezone.now(),
    )
    released = 0
    for reservation in expired.iterator():
        try:
            DiscountService.release(
                reservation.discount_rule,
                reservation.quote_id,
                reason="Reservation expired",
            )
            released += 1
        except DiscountError:
            # The reservation may have been consumed or released after this query.
            continue
    return released
