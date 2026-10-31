from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class AuthIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_registration_creates_customer_and_refresh_cookie_rotates(self):
        response = self.client.post("/api/v1/auth/register/", {
            "full_name": "Sample Customer",
            "email": "sample@example.com",
            "password": "SecurePass!9",
        }, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["role"], "customer")
        self.assertTrue(hasattr(get_user_model().objects.get(email="sample@example.com"), "customer_profile"))
        self.assertTrue(response.cookies["refresh_token"]["httponly"])
        first_refresh = response.cookies["refresh_token"].value

        self.client.cookies["refresh_token"] = first_refresh
        refreshed = self.client.post("/api/v1/auth/refresh/", {}, format="json")

        self.assertEqual(refreshed.status_code, 200)
        self.assertNotEqual(refreshed.cookies["refresh_token"].value, first_refresh)

    def test_registration_rejects_short_or_weak_password(self):
        response = self.client.post("/api/v1/auth/register/", {
            "full_name": "Weak Customer",
            "email": "weak@example.com",
            "password": "weakpass1",
        }, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)
