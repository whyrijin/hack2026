# BrightLoop Integration Implementation Plan

> **For agentic workers:** Use executing-plans for implementation; independent domains are assigned through dispatching-parallel-agents.

**Goal:** Deliver a simple, database-backed subscription application with a complete quotation-to-payment workflow.
**Architecture:** Retain React/TypeScript, Django REST Framework, PostgreSQL, Celery/Redis/Beat. Reuse the existing pricing, lifecycle, invoice, and notification services. One shared API client drives operational and customer screens.
**Tech Stack:** Existing repository dependencies; Docker Compose and GitHub Actions.
**Spec:** User supplied Subscription_Management_System.pdf, API Reference, and Hackathon Plan. User approved full integration with simple sidebar on 2026-10-31 and delegated remaining design decisions.

## Global Constraints
- Preserve team work and financial records; resolve merged migrations without deleting database volumes.
- All displayed business records and totals come from authenticated APIs; never silently substitute sample data.
- Customer endpoints enforce ownership. Staff actions and configuration enforce roles on the server.
- Money uses decimal strings; one invoice per subscription cycle; retry-safe payment recording.
- Keep existing CI workflows; add checks for the actual application.
- Keep configuration in Django Admin; no payment gateway or bank integration is implied.

## Review Focus
- Existing migration histories and fresh PostgreSQL installations both work.
- Paused, resumed, expired, future-start and overdue subscriptions preserve billing eligibility.
- Duplicate invoice/payment requests cannot duplicate financial effects.
- Customer accounts cannot access another customer's data or internal actions.
- API failures remain visible; refresh and navigation show current persisted data.

## Tasks
- [ ] Core infrastructure: reproduce Django startup/migration failures, fix app registration and reconcile migrations, run migration and domain tests; repair recurring billing integration and pricing/date regressions.
- [ ] Invoice workflow: add authenticated list/detail/confirm/cancel/payment/document endpoints around existing services; add ownership, partial-payment, overpayment, duplicate-request and PDF tests.
- [ ] Customer/report APIs: implement persisted customer list/create/detail/edit; aggregate real ledger values by currency/date; expose own-profile safely. Test authorization and reconciliation.
- [ ] Simple UI: shared sidebar (Overview, Customers, Subscriptions, Invoices, Reports); customer-only subscriptions/invoices/profile; remove fake success and mock fallbacks, reuse subscription editor, show errors and loading/empty states.
- [ ] Runtime integration: build Compose stack, apply migrations, seed repeatable demo records, exercise quotation → activation → billing scan → invoice → payment → reports/portal isolation.
- [ ] Delivery: frontend build/lint, full Django tests on PostgreSQL, migration drift check, CI application checks, startup/recovery documentation and precise limitations.

## Shared HTTP contracts
All routes use /api/v1 and trailing slash. Paginated lists return {count,next,previous,results}. Errors use {code,message,fields}. Existing subscriptions and catalog contracts remain.
Customers: GET/POST /customers/, GET/PATCH /customers/{id}/; fields id,name,email,company,phone,billing_address,notes (persisted); frontend adapts existing table shape.
Invoices: GET /invoices/, GET /invoices/{uuid}/; POST /invoices/{uuid}/confirm/,cancel/,payments/,pdf/,send/; GET /invoices/{uuid}/pdf/; portal equivalents for list/detail/pdf are scoped read-only.
Invoice fields: id,invoice_number,subscription_id,customer_name,status,currency,subtotal,discount_total,tax_total,total,amount_paid,balance,period_start,period_end,due_date,lines,payments. Payment POST: amount,method,payment_date,reference,idempotency_key.
Reports: GET /reports/summary/, /reports/revenue/, /reports/overdue/. Currency query defaults INR and is echoed. Summary: active_subscriptions,customers,billed,collected,outstanding,overdue,currency. Revenue: {results:[{month,billed,collected}],currency}. Overdue uses invoice list fields.
