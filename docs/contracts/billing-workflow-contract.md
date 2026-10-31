# Billing Workflow Contracts: Invoices, Discounts, and Email

| Metadata | Value |
|---|---|
| Phase | Foundations, Hour 1 |
| Status | Implementation in progress; Rijin and Aby approved, team-wide email/status decisions pending |
| Owners | Rijin (invoice integration), Aby (discount service), all developers (email and shared status vocabulary) |
| Applies to | Django backend: `subscriptions`, `billing`, `discounts`, and Celery email tasks |

This document turns the Hour 1 integration points into concrete, reviewable interfaces. Rijin and Aby have accepted their respective contracts, as reported by the project owner. Email and invoice-status decisions remain pending team-wide confirmation. Foundational code now follows this proposal; the unresolved decisions remain subject to revision.

### Review record

| Reviewer | Scope | Decision | Date |
|---|---|---|---|
| Rijin Reji | Invoice generation contract | Accepted (reported by project owner) | 2026-10-31 |
| Aby John | Discount reservation contract | Accepted (reported by project owner) | 2026-10-31 |

## 1. Shared conventions

- Use Python `UUID` for model identifiers, `date` for billing period boundaries, `Decimal` for money, and timezone-aware `datetime` for event timestamps.
- Service functions raise documented domain exceptions for invalid input or state. They must not return ambiguous `None` for failures.
- Operations that change invoice or discount state run in `transaction.atomic()`.
- Retrying a request or Celery task must not create duplicate invoices, consume a discount twice, or create duplicate outbox records. Email delivery through SMTP is at-least-once; a worker crash after the mail server accepts a message but before the sent state commits can result in a duplicate delivery.

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

Location: `backend/billing/services/invoices.py`. It calls the dotted callable configured by `BILLING_PERIOD_PRICING_PROVIDER`; the default adapter carries the accepted `Subscription` price snapshots into invoice lines. Subscription creation and draft edits call `products.services.calculate_price`, which currently calculates plan and product prices with additive taxes from the existing catalog models. Discount application remains unintegrated and needs alignment with the catalog contract before it is considered complete.

Provider shape: `price_subscription_period(subscription, period_start, period_end) -> dict`, matching the output structure in `aby-catalog-pricing-contract.md`. Invoice generation validates that line snapshots reconcile with the pricing totals before creating the invoice.

### Proposed behavior

1. Treat the period as **start-inclusive, end-exclusive**: `[period_start, period_end)`. Reject `period_end <= period_start`.
2. Look up the subscription by ID; raise `SubscriptionNotFound` if it does not exist. Resolve eligibility from lifecycle events effective at the period start, so a retry for an earlier active period can still succeed after the subscription has since been paused or closed.
3. Create one invoice for a subscription cycle. Enforce a database uniqueness constraint on `(subscription, period_start)` so a changed period end cannot create a second invoice for the same cycle. Repeating the same call returns the existing invoice, including after a task retry; a conflicting period end is rejected.
4. Snapshot every invoice line's description, quantity, currency, unit price, discount, tax, and totals. Later catalog edits must not change an existing invoice.
5. Create the invoice in `Draft`. Invoice confirmation and payment are separate state transitions and are not side effects of invoice generation.
6. Build the accepted subscription price through the shared pricing service, then carry the saved amount and tax snapshots into each invoice. Do not re-read mutable catalog prices for an already accepted subscription.
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
- A repeated call with the same key and same content returns the existing result and does not create another outbox record. Reusing a key for different template/recipient/context raises `EmailDedupeConflict`. Delivery is at-least-once because SMTP and the database cannot share one atomic transaction.
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

## 6. Proposed model design

These are MVP model proposals to review alongside the service contracts. Use UUID primary keys and `created_at` timestamps. Monetary values use `DecimalField(max_digits=12, decimal_places=2)`; do not use floating-point fields for money.

### `Invoice` (`billing` app)

| Field | Proposed type / rule | Purpose |
|---|---|---|
| `id` | UUID primary key | Stable public identifier. |
| `subscription` | Foreign key to `subscriptions.Subscription`, `PROTECT`, related name `invoices` | Owning subscription; preserve billing history if a subscription is removed. |
| `period_start`, `period_end` | `DateField` | Start-inclusive/end-exclusive billing period. |
| `status` | `CharField(16)`, choices `Draft`, `Confirmed`, `Paid`, `Cancelled`; default `Draft` | Invoice lifecycle. |
| `currency` | `CharField(3)` | Currency snapshot for the invoice. |
| `subtotal`, `discount_total`, `tax_total`, `total` | `DecimalField(12, 2)`, default `0.00` | Invoice-level monetary snapshots. |
| `due_date` | Nullable `DateField` | Payment deadline, if applicable. |
| `confirmed_at`, `paid_at`, `cancelled_at` | Nullable `DateTimeField` | Lifecycle audit timestamps. |
| `created_at`, `updated_at` | `DateTimeField` | Record timestamps. |

Database constraints: unique `(subscription, period_start, period_end)`; check `period_end > period_start`; check all invoice totals are nonnegative. Model/service validation enforces allowed status transitions.

### `InvoiceLine` (`billing` app)

| Field | Proposed type / rule | Purpose |
|---|---|---|
| `id` | UUID primary key | Stable line identifier. |
| `invoice` | Foreign key to `Invoice`, `CASCADE`, related name `lines` | Parent invoice. |
| `line_number` | `PositiveIntegerField` | Stable display order; unique within one invoice. |
| `description` | `CharField(255)` | Description snapshot shown on the invoice. |
| `quantity` | `DecimalField(12, 3)` | Quantity snapshot. |
| `unit_price`, `gross_amount`, `discount_amount`, `taxable_amount`, `tax_amount`, `total_amount` | `DecimalField(12, 2)` | Immutable pricing snapshots from the authoritative pricing service. |
| `tax_rate` | Nullable `DecimalField(7, 4)` | Applied rate snapshot for audit/display. |
| `source_type`, `source_id` | `CharField(32)` and nullable `CharField(64)` | Optional pointer to the plan/product without making historical lines depend on a live catalog row. Supports integer catalog IDs and UUID-backed sources. |

Database constraints: unique `(invoice, line_number)`; `quantity > 0`; monetary line values are nonnegative. Invoice lines become immutable after the invoice leaves `Draft`; enforce that rule through the billing service/model validation.

### `DiscountReservation` (`discounts` app)

| Field | Proposed type / rule | Purpose |
|---|---|---|
| `id` | UUID primary key | Reservation identifier. |
| `discount_rule` | Foreign key to `DiscountRule`, `PROTECT`, related name `reservations` | Rule whose quota is held. |
| `quote_id` | UUID field | Owning quote key; avoids requiring the quotations model to be ready first. |
| `status` | `CharField(16)` with `reserved`, `consumed`, `released` | Reservation lifecycle, separate from invoice statuses. |
| `expires_at`, `consumed_at`, `released_at` | Nullable `DateTimeField` | Reservation expiry and audit timestamps. |
| `release_reason` | Blankable `CharField(255)` | Why the reservation was released (for example, cancellation or expiry). |
| `invoice_id` | Nullable UUID field | Invoice that consumed the reservation, if applicable. |
| `created_at`, `updated_at` | `DateTimeField` | Record timestamps. |

Database constraint: unique `(discount_rule, quote_id)`. Counter changes and reservation status changes must occur in the same atomic transaction. Confirm whether `invoice_id` should become a foreign key after the billing schema is approved.

### `EmailOutbox` (`notifications` app, if approved)

| Field | Proposed type / rule | Purpose |
|---|---|---|
| `id` | UUID primary key | Queue record identifier. |
| `template` | `CharField(100)` | Registered template key. |
| `recipient` | `EmailField` | One recipient per message. |
| `context` | `JSONField` | Serializable template values. |
| `dedupe_key` | `CharField(200)`, unique | Idempotency key for one logical email. |
| `status` | `CharField(16)` with `queued`, `sending`, `sent`, `failed` | Delivery state. |
| `attempts` | `PositiveIntegerField`, default `0` | Retry tracking. |
| `last_error` | Blankable text | Most recent delivery failure. |
| `created_at`, `sending_at`, `sent_at` | `DateTimeField`, delivery timestamps nullable | Queue, active-delivery lease, and completion timestamps. |

Create the outbox row in the business transaction and publish its task on commit. Reusing a dedupe key with a different template, recipient, or context is a conflict. Team must confirm this model is in the MVP scope.

## 7. Implementation status and remaining work

Implemented in the current integration: invoice and line models, discount rule and reservation models/services, the email outbox and Celery tasks, invoice status transitions, migrations, and the default plan/product/tax pricing provider. Invoice generation now validates historical eligibility, uses accepted subscription snapshots, and is unique per subscription cycle start. The provider does not yet apply discount rules, wire discount reservation consumption to invoice/payment changes, or expose a complete payment and PDF API. Email delivery uses the console backend in containers by default; SMTP can be configured with environment variables.

## 8. Hour 1 completion checklist

To close H1, record each remaining decision in this document or in the team's agreed design record:

- [x] Rijin confirms the invoice signature, period semantics, idempotency, and eligibility rules.
- [x] Aby confirms the discount signatures, reservation identity, consume point, and expiry behavior.
- [ ] Everyone confirms email signature, outbox/dedupe behavior, and template naming.
- [ ] Everyone confirms the four invoice status values and transition table.
- [ ] Update the status at the top of this document to `Approved` and add the date and approvers.

Remaining implementation can proceed in this order: implement Aby's catalog pricing provider; wire invoice confirmation/payment events to discount consumption and email queuing; then add integration tests for retries, concurrent discount claims, and invalid transitions.
