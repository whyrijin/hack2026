"""Adapt Aby's catalog pricing DTO to the invoice service's snapshot format."""
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.utils.module_loading import import_string


def price_subscription_period(subscription, period_start, period_end):
    """Price one saved subscription cycle without duplicating pricing math.

    ``products.services.calculate_price`` is supplied by the catalog/pricing
    integration. This adapter only reshapes its DTO for billing; it does not
    calculate money or apply its own discount/tax rules.
    """
    provider_path = getattr(settings, 'SUBSCRIPTION_PRICING_PROVIDER', '')
    if not provider_path:
        raise ImproperlyConfigured('Configure SUBSCRIPTION_PRICING_PROVIDER before creating invoices.')
    try:
        calculate_price = import_string(provider_path)
    except (ImportError, AttributeError, ValueError) as exc:
        raise ImproperlyConfigured(f'SUBSCRIPTION_PRICING_PROVIDER could not be loaded: {provider_path!r}.') from exc

    lines = [
        {
            'product_id': line.product_id,
            'variant_id': line.variant_id,
            'quantity': line.quantity,
        }
        for line in subscription.lines.select_related('product', 'variant').all()
    ]
    result = calculate_price(
        plan=subscription.plan,
        lines=lines,
        effective_date=period_start,
    )
    if not isinstance(result, dict) or not isinstance(result.get('lines'), list):
        raise ValueError('The pricing service must return the documented pricing DTO.')

    plan_summary = result.get('plan_summary')
    if plan_summary:
        plan_summary = {
            'plan_name': plan_summary.get('name') or subscription.plan.name,
            'base_fee': plan_summary.get('base_fee', 0),
            'discount_amount': plan_summary.get('discount_amount', 0),
            'net_amount': plan_summary.get('net_amount'),
            'tax_rate': plan_summary.get('tax_rate'),
            'tax_amount': plan_summary.get('tax_amount', 0),
            'total_amount': plan_summary.get('final_total'),
        }

    invoice_lines = []
    for line in result['lines']:
        invoice_lines.append({
            'product_name': line.get('product_name'),
            'variant_name': line.get('variant_label'),
            'quantity': line.get('quantity', 1),
            'effective_unit_price': line.get('effective_unit_price', line.get('unit_sales_price')),
            'gross_amount': line.get('line_subtotal'),
            'discount_amount': line.get('discount_amount', 0),
            'net_amount': line.get('line_net_amount'),
            'tax_rate': line.get('tax_rate'),
            'tax_amount': line.get('tax_amount', 0),
            'total_amount': line.get('final_line_total'),
        })

    return {
        'currency': result.get('currency', subscription.currency),
        'plan_summary': plan_summary,
        'lines': invoice_lines,
        'subtotal': result.get('subtotal'),
        'total_discount': result.get('total_discount'),
        'total_tax': result.get('total_tax'),
        'final_total': result.get('final_total'),
    }
