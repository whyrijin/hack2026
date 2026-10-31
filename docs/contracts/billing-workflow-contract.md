# Billing Workflow Contracts: Invoices, Discounts, and Email

| Metadata | Value |
|---|---|
| Phase | Foundations, Hour 1 |
| Status | Proposal for review; not team-approved yet |
| Owners | Rijin (invoice integration), Aby (discount service), all developers (email and shared status vocabulary) |
| Applies to | Django backend: `subscriptions`, `billing`, `discounts`, and Celery email tasks |

This document turns the Hour 1 integration points into concrete, reviewable interfaces. Confirm the open choices with the named teammates before treating the contracts as frozen. No production implementation is implied by this proposal.

## 1. Shared conventions

- Use Python `UUID` for model identifiers, `date` for billing period boundaries, `Decimal` for money, and timezone-aware `datetime` for event timestamps.
- Service functions raise documented domain exceptions for invalid input or state. They must not return ambiguous `None` for failures.
- Operations that change invoice or discount state run in `transaction.atomic()`.
- Retrying a request or Celery task must not create duplicate invoices, consume a discount twice, or send the same logical email twice.

## 2. Invoice generation — confirm with Rijin

### Proposed public signature

```python
def create_invoice_for_period(
    subscription_id: UUID,
    period_start: date,
    period_end: date,
) -> Invoice:
    ...
```

Suggested location: `backend/billing/services/invoices.py`.

### Proposed behavior

1. Treat the period as **start-inclusive, end-exclusive**: `[period_start, period_end)`. Reject `period_end <= period_start`.
2. Look up the subscription by ID; raise `SubscriptionNotFound` if it does not exist. Reject a subscription that is not eligible for billing using a named `SubscriptionNotBillable` error.
3. Create one invoice for a subscription and exact period. Enforce a database uniqueness constraint on `(subscription, period_start, period_end)`. Repeating the same call returns the existing invoice, including after a task retry.
4. Snapshot every invoice line's description, quantity, currency, unit price, discount, tax, and totals. Later catalog edits must not change an existing invoice.
5. Create the invoice in `Draft`. Invoice confirmation and payment are separate state transitions and are not side effects of invoice generation.
6. Build invoice values through the shared authoritative pricing service agreed with Aby; do not reproduce price or tax math inside billing.
7. Do not send email inside this function. The caller queues notifications after commit.

### Team decision for Rijin

- Confirm the function location/import path and return type (`Invoice` model versus a result object).
- Confirm eligibility rules (for example, only active subscriptions) and the source of line items/pricing snapshots.
- Confirm whether period boundaries should be `[start, end)` and whether repeated calls return the existing invoice.

## 3. Discount reserve / consume / release — confirm with Aby

The existing catalog and pricing proposal already names `DiscountService.reserve(rule, quote_id)`, `consume(rule, quote_id)`, and `release(rule, quote_id)`. This proposal keeps that shared key and makes the keyword arguments explicit:

```python
class DiscountService:
    @staticmethod
    def reserve(rule: DiscountRule, quote_id: UUID, *, expires_at: datetime | None = None) -> DiscountReservation:
        ...

    @staticmethod
    def consume(rule: DiscountRule, quote_id: UUID, *, invoice_id: UUID | None = None) -> DiscountReservation:
        ...

    @staticmethod
    def release(rule: DiscountRule, quote_id: UUID, *, reason: str | None = None) -> DiscountReservation:
        ...
```

Suggested location: `backend/discounts/services.py`.

### Proposed behavior

- A reservation is identified by `(discount_rule, quote_id)` and has a database uniqueness constraint. The same operation repeated with the same key is idempotent.
- `reserve` atomically claims one available use, respecting `max_uses`, and creates or returns that reservation. A quota race raises `DiscountQuotaExhausted`.
- `consume` changes an existing active reservation to consumed exactly once, decrements `times_reserved`, and increments `times_used`. An optional `invoice_id` links the consuming invoice for audit.
- `release` changes an existing active reservation to released exactly once and decrements `times_reserved`. Releasing a consumed reservation is an invalid transition.
- Calling `consume` or `release` for a missing reservation raises `DiscountReservationNotFound`; repeating the matching final operation returns the existing reservation without changing counters.
- All counter updates are atomic and protected against concurrent redemption (row lock or conditional update). Previewing a price never reserves or consumes a discount.
- The caller decides lifecycle timing: reserve when a quote is sent/finalized; consume at the agreed acceptance/payment point; release on rejection, expiry, or cancellation.

### Team decision for Aby

- Confirm that quote ID is the reservation key for this MVP, and whether the service receives a `DiscountRule` object or its ID.
- Confirm the exact consume point (quote acceptance or first invoice payment) and reservation expiry policy.
- Confirm if `DiscountReservation` is a model/result type and which errors should be public.

## 4. Email queue — confirm with everyone

### Proposed public signature

```python
def queue_email(
    template: str,
    recipient: str,
    context: Mapping[str, object],
    dedupe_key: str,
) -> EmailQueueResult:
    ...
```

Suggested location: `backend/notifications/services.py`; the Celery task that renders and sends mail should live in `backend/notifications/tasks.py`.

### Proposed behavior

- `template` is a registered template key, not an arbitrary file path. `recipient` is a single email address. `context` must be JSON-serializable. `dedupe_key` is a required stable key for one logical notification.
- Persist an email/outbox record with a unique `dedupe_key`. Enqueue delivery with `transaction.on_commit()` so workers cannot send an email for a transaction that later rolls back.
- A repeated call with the same key and same content returns the existing result and does not create another send. Reusing a key for different template/recipient/context raises `EmailDedupeConflict`.
- Return an `EmailQueueResult` containing the outbox/email ID and whether it was newly queued or already existed. Mail transport failures are handled by Celery retry and recorded on the outbox row; they do not make the business transaction fail.

### Team decision for everyone

- Confirm the `notifications` app, whether an outbox model is in scope for MVP, and the result type.
- Agree on template-key naming and stable dedupe-key conventions (for example `invoice:{invoice_id}:confirmed`).
- Confirm retry limits and whether one recipient per call is sufficient.

## 5. Frozen invoice status vocabulary

Use these exact, case-sensitive values for invoice status:

```text
Draft
Confirmed
Paid
Cancelled
```

Suggested transition rules:

| Current | Allowed next status | Meaning |
|---|---|---|
| `Draft` | `Confirmed`, `Cancelled` | Draft is editable; confirmation issues the invoice. |
| `Confirmed` | `Paid`, `Cancelled` | Issued and awaiting payment; cancellation voids it. |
| `Paid` | none | Settled; corrections/refunds require a separate workflow. |
| `Cancelled` | none | Voided terminal state. |

`create_invoice_for_period` creates `Draft`. Only a successful payment event may move `Confirmed` to `Paid`. Enforce transitions in a domain method/service, not only in UI code. Do not add alternate spellings or lowercase values. Other models may have their own statuses; this frozen set is for invoices unless the team explicitly decides otherwise.

## 6. Hour 1 completion checklist

Before implementation begins, record each decision in this document or in the team's agreed design record:

- [ ] Rijin confirms the invoice signature, period semantics, idempotency, and eligibility rules.
- [ ] Aby confirms the discount signatures, reservation identity, consume point, and expiry behavior.
- [ ] Everyone confirms email signature, outbox/dedupe behavior, and template naming.
- [ ] Everyone confirms the four invoice status values and transition table.
- [ ] Update the status at the top of this document to `Approved` and add the date and approvers.

After approval, implementation can proceed in this order: define shared constants/errors and model fields; add uniqueness constraints and migrations; implement invoice and discount services; implement the email outbox and Celery task; wire status transitions; then add integration tests for retries, concurrent discount claims, and invalid transitions.
