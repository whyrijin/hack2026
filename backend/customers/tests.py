from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from customers.models import Customer


class CustomerApiTests(TestCase):
    def setUp(self):
        self.staff = get_user_model().objects.create_user('staff', is_staff=True)
        self.user = get_user_model().objects.create_user('customer')
        self.client = APIClient()

    def test_customer_create_edit_is_persisted(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post('/api/v1/customers/', {
            'name': 'Ada', 'email': 'ada@example.com', 'company': 'A',
            'billing_address': {'line1': 'One Road', 'city': 'Kochi'}, 'notes': 'Net 7',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        pk = response.data['id']
        edited = self.client.patch(f'/api/v1/customers/{pk}/', {'phone': '+91 123'}, format='json')
        self.assertEqual(edited.status_code, 200)
        self.assertEqual(Customer.objects.get(pk=pk).phone, '+91 123')
        fetched = self.client.get(f'/api/v1/customers/{pk}/')
        self.assertEqual(fetched.data['billing_address']['city'], 'Kochi')
        self.assertEqual(fetched.data['notes'], 'Net 7')
        self.assertEqual(self.client.get('/api/v1/customers/?search=Ada').data['count'], 1)

    def test_customer_cannot_read_staff_directory(self):
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get('/api/v1/customers/').status_code, 403)
        self.assertEqual(self.client.post('/api/v1/customers/', {'name': 'Bad'}).status_code, 403)

    def test_profile_update_is_scoped_and_rejects_privilege_fields(self):
        Customer.objects.create(user=self.user, name='Customer', email='c@example.com')
        self.client.force_authenticate(self.user)
        response = self.client.patch('/api/v1/me/', {'full_name': 'New Name', 'company': 'New Co'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.get_full_name(), 'New Name')
        self.assertEqual(self.user.customer_profile.company, 'New Co')
        denied = self.client.patch('/api/v1/me/', {'is_staff': True}, format='json')
        self.assertEqual(denied.status_code, 400)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_staff)
