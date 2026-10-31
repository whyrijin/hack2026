from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from customers.models import Customer
from plans.models import Plan
from products.models import Product
from subscriptions.models import Subscription


class SubscriptionApiIntegrationTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.staff = user_model.objects.create_user(
            username="staff@example.com",
            email="staff@example.com",
            password="SecurePass!9",
            is_staff=True,
        )
        self.customer_user = user_model.objects.create_user(
            username="customer@example.com",
            email="customer@example.com",
            password="SecurePass!9",
        )
        self.customer = Customer.objects.create(
            user=self.customer_user,
            name="Customer One",
            email="customer@example.com",
        )
        self.plan = Plan.objects.create(
            name="Monthly Plan",
            base_price=Decimal("100.00"),
            billing_cadence=Plan.Cadence.MONTHLY,
            availability_start_date=date(2020, 1, 1),
        )
        self.product = Product.objects.create(name="Support", sales_price=Decimal("50.00"))
        self.staff_client = APIClient()
        self.staff_client.force_authenticate(self.staff)

    def test_catalog_to_subscription_and_customer_portal_share_database_records(self):
        customers = self.staff_client.get("/api/v1/customers/")
        plans = self.staff_client.get("/api/v1/plans/")
        products = self.staff_client.get("/api/v1/products/")

        self.assertEqual(customers.data["results"][0]["id"], self.customer.pk)
        self.assertEqual(plans.data["results"][0]["id"], self.plan.pk)
        self.assertEqual(products.data["results"][0]["id"], self.product.pk)
        self.assertNotIn("cost_price", products.data["results"][0])

        created = self.staff_client.post("/api/v1/subscriptions/", {
            "customer_id": self.customer.pk,
            "plan_id": self.plan.pk,
            "start_date": timezone.localdate().isoformat(),
            "lines": [{"product_id": self.product.pk, "quantity": 1}],
        }, format="json")

        self.assertEqual(created.status_code, 201, created.data)
        subscription_id = created.data["id"]
        self.assertEqual(created.data["total"], "150.00")
        self.assertTrue(Subscription.objects.filter(pk=subscription_id, customer=self.customer).exists())

        for action in ("quote", "confirm", "activate"):
            result = self.staff_client.post(f"/api/v1/subscriptions/{subscription_id}/{action}/", {}, format="json")
            self.assertEqual(result.status_code, 200, result.data)

        customer_client = APIClient()
        customer_client.force_authenticate(self.customer_user)
        portal = customer_client.get("/api/v1/portal/subscriptions/")
        self.assertEqual(portal.status_code, 200)
        self.assertEqual([item["id"] for item in portal.data["results"]], [subscription_id])
        self.assertEqual(portal.data["results"][0]["status"], "ACTIVE")
        self.assertEqual(customer_client.get("/api/v1/customers/").status_code, 403)
