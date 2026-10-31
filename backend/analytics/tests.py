from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from billing.models import Invoice, InvoiceStatus
from customers.models import Customer
from payments.models import Payment
from plans.models import Plan
from subscriptions.models import Subscription


class LedgerReportTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = get_user_model().objects.create_user('report-staff', is_staff=True)
        self.client.force_authenticate(self.staff)
        self.customer = Customer.objects.create(name='Reporting', email='report@example.com')
        self.plan = Plan.objects.create(name='Monthly')
        self.sub = Subscription.objects.create(customer=self.customer, plan=self.plan,
            start_date=date(2026, 1, 1), status=Subscription.Status.ACTIVE)
        self.invoice = Invoice.objects.create(subscription=self.sub, invoice_number='INV-REPORT',
            period_start=date(2026, 1, 1), period_end=date(2026, 2, 1),
            status=InvoiceStatus.CONFIRMED, currency='INR', subtotal='100', total='100',
            confirmed_at=timezone.now(), due_date=timezone.localdate() - timedelta(days=1))
        Payment.objects.create(invoice=self.invoice, method='bank', amount='30', currency='INR',
            received_at=timezone.now(), idempotency_key='report-payment')

    def test_summary_reconciles_and_excludes_draft_and_other_currency(self):
        for currency, state, start in [('INR', InvoiceStatus.DRAFT, date(2026, 2, 1)), ('USD', InvoiceStatus.CONFIRMED, date(2026, 3, 1))]:
            Invoice.objects.create(subscription=self.sub, invoice_number='INV-'+currency,
                period_start=start, period_end=start + timedelta(days=28), status=state,
                confirmed_at=timezone.now(), currency=currency, subtotal='999', total='999')
        response = self.client.get('/api/v1/reports/summary/?currency=INR')
        self.assertEqual(response.status_code, 200)
        for key, value in [('billed', '100.00'), ('collected', '30.00'), ('outstanding', '70.00'), ('overdue', '70.00')]:
            self.assertEqual(response.data[key], value)
        self.assertEqual(response.data['active_subscriptions'], 1)
        self.assertEqual(self.client.get('/api/v1/reports/overdue/').data['count'], 1)

    def test_revenue_matches_payment_and_invoice_dates(self):
        response = self.client.get('/api/v1/reports/revenue/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(sum(Decimal(x['billed']) for x in response.data['results']), Decimal('100'))
        self.assertEqual(sum(Decimal(x['collected']) for x in response.data['results']), Decimal('30'))
        bad = self.client.get('/api/v1/reports/summary/?date_from=invalid')
        self.assertEqual(bad.status_code, 400)

    def test_customer_cannot_read_company_reports(self):
        self.client.force_authenticate(get_user_model().objects.create_user('portal'))
        self.assertEqual(self.client.get('/api/v1/reports/summary/').status_code, 403)
