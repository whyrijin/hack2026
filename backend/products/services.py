"""Server-side catalog price calculation shared by quote and invoice flows."""

from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import ValidationError

from .models import Product, ProductVariant

CENT = Decimal("0.01")
ZERO = Decimal("0.00")


def _money(value):
    return Decimal(value).quantize(CENT, rounding=ROUND_HALF_UP)


def _tax_rate(rules):
    return sum((rule.percentage_rate for rule in rules if rule.is_active), Decimal("0.00"))


def _tax(amount, rate):
    return _money(amount * rate / Decimal("100"))


def calculate_price(*, plan, lines, effective_date):
    """Return the agreed pricing DTO without accepting client-supplied amounts.

    Prices and tax rules come from the database. Amounts are tax-exclusive and
    rounded per line to the currency's minor unit.
    """
    base_fee = _money(plan.base_price)
    plan_tax_rate = _tax_rate(plan.taxes.all())
    plan_tax = _tax(base_fee, plan_tax_rate)
    result_lines = []
    subtotal = base_fee
    total_tax = plan_tax

    for requested in lines:
        if not isinstance(requested, dict):
            raise ValidationError({"lines": "Each line must identify a product and quantity."})
        try:
            product = Product.objects.prefetch_related("taxes").get(pk=requested["product_id"])
            quantity = int(requested["quantity"])
            if quantity < 1 or str(quantity) != str(requested["quantity"]).strip():
                raise ValueError
        except (Product.DoesNotExist, KeyError, TypeError, ValueError):
            raise ValidationError({"lines": "Each line must reference a valid product and positive whole quantity."})

        variant = None
        if requested.get("variant_id") not in (None, ""):
            try:
                variant = ProductVariant.objects.get(pk=requested["variant_id"], product=product)
            except (ProductVariant.DoesNotExist, TypeError, ValueError):
                raise ValidationError({"lines": "A selected variant must belong to the chosen product."})

        unit_price = _money(product.sales_price + (variant.price_adjustment if variant else ZERO))
        if unit_price < 0:
            raise ValidationError({"lines": "A product variant cannot have a negative effective price."})
        gross = _money(unit_price * quantity)
        tax_rate = _tax_rate(product.taxes.all())
        tax_amount = _tax(gross, tax_rate)
        line_total = gross + tax_amount
        result_lines.append({
            "product_id": product.pk,
            "variant_id": variant.pk if variant else None,
            "product_name": product.name,
            "variant_label": f"{variant.attribute_label}: {variant.option_value}" if variant else "",
            "quantity": quantity,
            "unit_sales_price": str(_money(product.sales_price)),
            "effective_unit_price": str(unit_price),
            "line_subtotal": str(gross),
            "discount_amount": str(ZERO),
            "tax_rate": str(tax_rate),
            "tax_amount": str(tax_amount),
            "line_net_amount": str(gross),
            "final_line_total": str(line_total),
        })
        subtotal += gross
        total_tax += tax_amount

    final_total = subtotal + total_tax
    return {
        "currency": "INR",
        "plan_summary": {
            "name": plan.name,
            "base_fee": str(base_fee),
            "discount_amount": str(ZERO),
            "tax_rate": str(plan_tax_rate),
            "tax_amount": str(plan_tax),
            "net_amount": str(base_fee),
            "final_total": str(base_fee + plan_tax),
        },
        "lines": result_lines,
        "subtotal": str(subtotal),
        "total_discount": str(ZERO),
        "total_tax": str(total_tax),
        "final_total": str(final_total),
    }
