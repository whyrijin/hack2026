from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from customers.models import Customer
from plans.models import PaymentTerm, Plan
from products.models import Product, ProductVariant
from quotations.models import QuoteTemplate, TemplateLine


class Command(BaseCommand):
    help = 'Create or refresh the sample customer, monthly plan, product, variant, and quote template.'

    @transaction.atomic
    def handle(self, *args, **options):
        customer, _ = Customer.objects.update_or_create(
            email='demo-customer@example.test',
            defaults={
                'name': 'Jordan Lee',
                'company': 'Northstar Demo Studio',
                'phone': '+91 90000 12345',
                'billing_address': '42 Example Street, Bengaluru, Karnataka',
            },
        )
        plan, _ = Plan.objects.update_or_create(
            name='Demo Monthly Plan',
            defaults={
                'base_price': Decimal('9999.00'),
                'billing_cadence': Plan.Cadence.MONTHLY,
                'minimum_quantity': 1,
                'allow_pause': True,
                'allow_early_closure': True,
                'allow_renewal': True,
                'auto_close': False,
                'is_active': True,
            },
        )
        payment_term, _ = PaymentTerm.objects.update_or_create(
            name='Demo Net 15',
            defaults={'days_until_due': 15, 'is_active': True},
        )
        plan.payment_term = payment_term
        plan.save(update_fields=['payment_term', 'updated_at'])
        product, _ = Product.objects.update_or_create(
            name='Demo Workspace License',
            defaults={
                'type': Product.Type.SERVICE,
                'sales_price': Decimal('1500.00'),
                'cost_price': Decimal('500.00'),
                'notes': 'Sample catalog item for subscription workflow demos.',
                'is_active': True,
            },
        )
        variant, _ = ProductVariant.objects.update_or_create(
            product=product,
            attribute_label='Edition',
            option_value='Pro',
            defaults={'price_adjustment': Decimal('500.00'), 'is_active': True},
        )
        template, _ = QuoteTemplate.objects.update_or_create(
            name='Demo Subscription Quote',
            defaults={
                'plan': plan,
                'validity_days': 14,
                'payment_term': payment_term,
                'is_active': True,
            },
        )
        TemplateLine.objects.update_or_create(
            template=template,
            product=product,
            variant=variant,
            defaults={'quantity': 1, 'position': 0},
        )
        self.stdout.write(self.style.SUCCESS('Demo subscription records are ready:'))
        self.stdout.write(f'  customer_id={customer.pk} ({customer.name})')
        self.stdout.write(f'  plan_id={plan.pk} ({plan.name})')
        self.stdout.write(f'  product_id={product.pk} ({product.name})')
        self.stdout.write(f'  variant_id={variant.pk} ({variant.attribute_label}: {variant.option_value})')
        self.stdout.write(f'  template_id={template.pk} ({template.name})')
