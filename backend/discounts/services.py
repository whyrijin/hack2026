"""Transactional operations for capped discount reservations."""

from datetime import datetime
from uuid import UUID

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from .models import DiscountReservation, DiscountRule


class DiscountError(Exception):
    """Base class for discount lifecycle errors."""


class DiscountUnavailable(DiscountError):
    """The rule is inactive, outside its validity window, or out of quota."""


class DiscountQuotaExhausted(DiscountUnavailable):
    """No redemption quota remains for the rule."""


class DiscountReservationNotFound(DiscountError):
    """No reservation exists for the supplied rule and quote."""


class InvalidDiscountReservationState(DiscountError):
    """The requested operation is invalid for the reservation's current state."""


class DiscountReservationExpired(InvalidDiscountReservationState):
    """The reservation expired before it could be consumed."""


class DiscountService:
    @staticmethod
    def reserve(
        rule: DiscountRule,
        quote_id: UUID,
        *,
        expires_at: datetime | None = None,
    ) -> DiscountReservation:
        now = timezone.now()
        if expires_at is not None and (timezone.is_naive(expires_at) or expires_at <= now):
            raise ValueError("expires_at must be a future, timezone-aware datetime.")
        expired = False
        result = None
        with transaction.atomic():
            locked_rule = DiscountRule.objects.select_for_update().get(pk=rule.pk)
            reservation = (
                DiscountReservation.objects.select_for_update()
                .filter(discount_rule=locked_rule, quote_id=quote_id)
                .first()
            )

            if reservation is not None:
                if reservation.status != DiscountReservation.Status.RESERVED:
                    raise InvalidDiscountReservationState(
                        f"Cannot reserve a discount already {reservation.status}."
                    )
                if reservation.expires_at and reservation.expires_at <= now:
                    DiscountService._release_locked(locked_rule, reservation, "Reservation expired")
                    expired = True
                else:
                    return reservation

            if not expired:
                if not locked_rule.is_active or locked_rule.valid_from > now:
                    raise DiscountUnavailable("Discount is not currently available.")
                if locked_rule.valid_to is not None and locked_rule.valid_to < now:
                    raise DiscountUnavailable("Discount has expired.")
                if locked_rule.max_uses is not None:
                    if locked_rule.times_used + locked_rule.times_reserved >= locked_rule.max_uses:
                        raise DiscountQuotaExhausted("Discount quota has been exhausted.")

                result = DiscountReservation.objects.create(
                    discount_rule=locked_rule,
                    quote_id=quote_id,
                    status=DiscountReservation.Status.RESERVED,
                    expires_at=expires_at,
                )
                DiscountRule.objects.filter(pk=locked_rule.pk).update(times_reserved=F("times_reserved") + 1)

        if expired:
            raise DiscountReservationExpired("The quote's discount reservation has expired.")
        return result

    @staticmethod
    def consume(
        rule: DiscountRule,
        quote_id: UUID,
        *,
        invoice_id: UUID | None = None,
    ) -> DiscountReservation:
        now = timezone.now()
        expired = False
        result = None
        with transaction.atomic():
            locked_rule = DiscountRule.objects.select_for_update().get(pk=rule.pk)
            reservation = DiscountService._get_locked_reservation(locked_rule, quote_id)

            if reservation.status == DiscountReservation.Status.CONSUMED:
                if invoice_id is not None and reservation.invoice_id not in (None, invoice_id):
                    raise InvalidDiscountReservationState("Reservation was consumed by a different invoice.")
                if invoice_id is not None and reservation.invoice_id is None:
                    reservation.invoice_id = invoice_id
                    reservation.save(update_fields=("invoice_id", "updated_at"))
                return reservation
            if reservation.status != DiscountReservation.Status.RESERVED:
                raise InvalidDiscountReservationState(f"Cannot consume a {reservation.status} reservation.")
            if reservation.expires_at and reservation.expires_at <= now:
                DiscountService._release_locked(locked_rule, reservation, "Reservation expired")
                expired = True
            else:
                reservation.status = DiscountReservation.Status.CONSUMED
                reservation.consumed_at = now
                reservation.invoice_id = invoice_id
                reservation.save(update_fields=("status", "consumed_at", "invoice_id", "updated_at"))
                DiscountRule.objects.filter(pk=locked_rule.pk).update(
                    times_reserved=F("times_reserved") - 1,
                    times_used=F("times_used") + 1,
                )
                result = reservation

        if expired:
            raise DiscountReservationExpired("Discount reservation has expired.")
        return result

    @staticmethod
    def release(rule: DiscountRule, quote_id: UUID, *, reason: str | None = None) -> DiscountReservation:
        with transaction.atomic():
            locked_rule = DiscountRule.objects.select_for_update().get(pk=rule.pk)
            reservation = DiscountService._get_locked_reservation(locked_rule, quote_id)
            if reservation.status == DiscountReservation.Status.RELEASED:
                return reservation
            if reservation.status != DiscountReservation.Status.RESERVED:
                raise InvalidDiscountReservationState("A consumed discount reservation cannot be released.")
            return DiscountService._release_locked(locked_rule, reservation, reason or "")

    @staticmethod
    def _get_locked_reservation(rule, quote_id):
        try:
            return DiscountReservation.objects.select_for_update().get(
                discount_rule=rule,
                quote_id=quote_id,
            )
        except DiscountReservation.DoesNotExist as exc:
            raise DiscountReservationNotFound("No discount reservation exists for this quote.") from exc

    @staticmethod
    def _release_locked(rule, reservation, reason):
        reservation.status = DiscountReservation.Status.RELEASED
        reservation.released_at = timezone.now()
        reservation.release_reason = reason[:255]
        reservation.save(update_fields=("status", "released_at", "release_reason", "updated_at"))
        DiscountRule.objects.filter(pk=rule.pk).update(times_reserved=F("times_reserved") - 1)
        return reservation
