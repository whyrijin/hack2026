"""Materialize trusted catalog records before calling the shared pricing engine."""

from datetime import date, datetime, time
from decimal import Decimal

from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from discounts.models import DiscountRule
from plans.models import Plan
from products.models import Product, ProductVariant
from products.services.pricing import calculate_price as calculate


def _tax_rates(taxes):
    return [tax.percentage_rate for tax in taxes if tax.is_active]


def _plan_dto(plan):
    if plan is None:
        return None
    if isinstance(plan, dict):
        return plan
    return {
        "id": plan.pk,
        "name": plan.name,
        "billing_cadence": plan.billing_cadence,
        "base_price": plan.base_price,
        "minimum_quantity": plan.minimum_quantity,
        "tax_rates": _tax_rates(plan.taxes.all()),
    }


def _line_dtos(lines):
    if not isinstance(lines, (list, tuple)):
        raise ValidationError({"lines": "Provide a list of product lines."})
    result = []
    for index, requested in enumerate(lines):
        if not isinstance(requested, dict):
            raise ValidationError({"lines": {index: "Each line must be an object."}})
        if isinstance(requested.get("product"), dict):
            # Billing uses the price and tax snapshots saved on the subscription.
            result.append(requested)
            continue
        try:
            product = Product.objects.prefetch_related("taxes").get(
                pk=requested["product_id"], is_active=True
            )
            raw_quantity = requested.get("quantity", 1)
            quantity = int(raw_quantity)
            if isinstance(raw_quantity, bool) or str(quantity) != str(raw_quantity).strip() or quantity < 1:
                raise ValueError
        except (Product.DoesNotExist, KeyError, TypeError, ValueError):
            raise ValidationError({"lines": {index: "Choose an active product and a positive whole quantity."}})
        variant = None
        if requested.get("variant_id") not in (None, ""):
            try:
                variant = ProductVariant.objects.get(
                    pk=requested["variant_id"], product=product, is_active=True
                )
            except (ProductVariant.DoesNotExist, TypeError, ValueError):
                raise ValidationError({"lines": {index: "Choose an active variant belonging to this product."}})
        variant_dto = None
        label = ""
        if variant:
            label = f"{variant.attribute_label}: {variant.option_value}"
            variant_dto = {
                "id": variant.pk,
                "product_id": product.pk,
                "label": label,
                "price_adjustment": variant.price_adjustment,
            }
        result.append({
            "product": {"id": product.pk, "name": product.name, "sales_price": product.sales_price},
            "product_id": product.pk,
            "product_name": product.name,
            "variant": variant_dto,
            "variant_id": variant.pk if variant else None,
            "variant_label": label,
            "quantity": quantity,
            "tax_rates": _tax_rates(product.taxes.all()),
        })
    return result


def _rule_dto(rule):
    if rule.scope == DiscountRule.Scope.PLAN:
        scope = "plan"
    elif rule.scope == DiscountRule.Scope.LINES:
        scope = "products"
    else:
        scope = "subscription"
    product_ids = list(rule.products.values_list("id", flat=True))
    return {
        "id": str(rule.pk),
        "name": rule.name,
        "discount_type": "fixed" if rule.discount_type == DiscountRule.DiscountType.FIXED_AMOUNT else "percentage",
        "value": rule.value,
        "scope": scope,
        "applicable_product_ids": product_ids,
        "max_discount_cap": rule.max_discount_cap,
    }


def _active_rules(effective_date, excluded_ids):
    start = timezone.make_aware(datetime.combine(effective_date, time.min))
    end = timezone.make_aware(datetime.combine(effective_date, time.max))
    rules = DiscountRule.objects.filter(is_active=True, valid_from__lte=end).filter(
        Q(valid_to__isnull=True) | Q(valid_to__gte=start)
    ).prefetch_related("products").order_by("id")
    return [
        rule for rule in rules
        if str(rule.pk) not in excluded_ids
        and (rule.max_uses is None or rule.times_used + rule.times_reserved < rule.max_uses)
    ]


def calculate_price(*, plan, lines, effective_date, exclude_discount_ids=()):
    """Calculate from active catalog records and choose the best eligible discount.

    Quote previews are side-effect free. Invoice creation reserves the selected
    capped rule in its own transaction before the invoice snapshot is written.
    """
    if isinstance(effective_date, str):
        try:
            effective_date = date.fromisoformat(effective_date)
        except ValueError as exc:
            raise ValidationError({"effective_date": "Use YYYY-MM-DD."}) from exc
    if not isinstance(effective_date, date):
        raise ValidationError({"effective_date": "Use YYYY-MM-DD."})

    plan_dto = _plan_dto(plan)
    if plan is not None and isinstance(plan, Plan):
        if not plan.is_active:
            raise ValidationError({"plan_id": "This plan is no longer active."})
        if effective_date < plan.availability_start_date or (
            plan.availability_end_date and effective_date > plan.availability_end_date
        ):
            raise ValidationError({"start_date": "The plan is not available on the selected start date."})
    lines_dto = _line_dtos(lines)
    base = calculate(plan=plan_dto, lines=lines_dto, effective_date=effective_date)
    quantity = sum(line["quantity"] for line in lines_dto)
    excluded = {str(value) for value in exclude_discount_ids}
    best = None
    for rule in _active_rules(effective_date, excluded):
        if rule.min_order_amount is not None and Decimal(str(base["subtotal"])) < rule.min_order_amount:
            continue
        if quantity < rule.minimum_quantity:
            continue
        candidate = _rule_dto(rule)
        priced = calculate(
            plan=plan_dto,
            lines=lines_dto,
            discount_to_apply=candidate,
            effective_date=effective_date,
        )
        saving = Decimal(str(priced["total_discount"]))
        if saving <= 0:
            continue
        if best is None or saving > best[0]:
            best = (saving, rule.pk, priced, rule)

    if best is None:
        return base
    _saving, _rule_id, result, rule = best
    result["discount_applied"].update({
        "rule_id": str(rule.pk),
        "code": rule.code or "",
        "value": str(rule.value),
        "minimum_quantity": rule.minimum_quantity,
        "min_order_amount": str(rule.min_order_amount) if rule.min_order_amount is not None else None,
    })
    return result
