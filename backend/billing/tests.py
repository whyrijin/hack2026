from datetime import date
from decimal import Decimal

from django.test import TestCase, override_settings

from billing.services.invoices import InvoicePeriodConflict, create_invoice_for_period
from customers.models import Customer
from plans.models import Plan
from subscriptions.models import Subscription, SubscriptionEvent


@override_settings(SUBSCRIPTION_PRICING_PROVIDER="products.services.calculate_price")
class InvoiceCycleIntegrationTests(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(name="Example Customer", email="customer@example.com")
        self.plan = Plan.objects.create(name="Monthly", base_price=Decimal("100.00"))
        self.subscription = Subscription.objects.create(
            customer=self.customer,
            plan=self.plan,
            status=Subscription.Status.PAUSED,
            cadence=Plan.Cadence.MONTHLY,
            start_date=date(2026, 1, 1),
            next_billing_date=date(2026, 3, 1),
            base_price_snapshot=Decimal("100.00"),
            subtotal=Decimal("100.00"),
            total=Decimal("100.00"),
        )
        SubscriptionEvent.objects.create(
            subscription=self.subscription,
            action="created",
            to_status=Subscription.Status.DRAFT,
            effective_on=date(2026, 1, 1),
        )
        SubscriptionEvent.objects.create(
            subscription=self.subscription,
            action="activate",
            from_status=Subscription.Status.CONFIRMED,
            to_status=Subscription.Status.ACTIVE,
            effective_on=date(2026, 1, 1),
        )
        SubscriptionEvent.objects.create(
            subscription=self.subscription,
            action="pause",
            from_status=Subscription.Status.ACTIVE,
            to_status=Subscription.Status.PAUSED,
            effective_on=date(2026, 2, 15),
        )

    def test_retries_bill_a_historically_active_cycle_after_pause(self):
        # A plan price change after the accepted subscription must not reprice it.
        self.plan.base_price = Decimal("900.00")
        self.plan.save(update_fields=["base_price"])
        invoice = create_invoice_for_period(
            self.subscription.pk,
            date(2026, 1, 1),
            date(2026, 2, 1),
        )

        self.assertEqual(invoice.total, Decimal("100.00"))
        self.assertEqual(invoice.lines.count(), 1)
        self.assertEqual(
            create_invoice_for_period(self.subscription.pk, date(2026, 1, 1), date(2026, 2, 1)).pk,
            invoice.pk,
        )

    def test_same_cycle_start_cannot_create_a_second_invoice_with_new_boundaries(self):
        create_invoice_for_period(self.subscription.pk, date(2026, 1, 1), date(2026, 2, 1))

        with self.assertRaises(InvoicePeriodConflict):
            create_invoice_for_period(self.subscription.pk, date(2026, 1, 1), date(2026, 2, 2))
