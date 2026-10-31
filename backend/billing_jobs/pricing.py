"""Adapt a quoted subscription's immutable price snapshot to invoice DTOs."""

from decimal import Decimal


def price_subscription_period(subscription, period_start, period_end):
    """Build an invoice from the prices accepted on the subscription quote.

    Catalog edits after confirmation must not silently change a customer's
    recurring price. Subscription creation/editing calls the shared catalog
    pricing service; this adapter carries those saved values into each cycle.
    """
    lines = list(subscription.lines.all())
    line_discounts = sum((line.discount_amount for line in lines), Decimal("0.00"))
    line_taxes = sum((line.tax_amount for line in lines), Decimal("0.00"))
    plan_discount = subscription.discount_total - line_discounts
    plan_tax = subscription.tax_total - line_taxes
    plan_base = subscription.base_price_snapshot
    plan_net = plan_base - plan_discount

    if min(plan_base, plan_discount, plan_tax, plan_net) < 0:
        raise ValueError("Subscription pricing snapshots do not reconcile to nonnegative plan amounts.")

    plan_summary = None
    if any((plan_base, plan_discount, plan_tax)):
        plan_tax_rate = (plan_tax * Decimal("100") / plan_net) if plan_net else Decimal("0.0000")
        plan_summary = {
            "plan_name": subscription.plan.name,
            "plan_id": subscription.plan_id,
            "base_fee": str(plan_base),
            "discount_amount": str(plan_discount),
            "net_amount": str(plan_net),
            "tax_rate": str(plan_tax_rate),
            "tax_amount": str(plan_tax),
            "total_amount": str(plan_net + plan_tax),
        }

    invoice_lines = [
        {
            "product_id": line.product_id,
            "product_name": line.product_name_snapshot,
            "variant_id": line.variant_id,
            "variant_name": line.variant_name_snapshot,
            "quantity": line.quantity,
            "effective_unit_price": str(line.unit_price),
            "gross_amount": str(line.gross_amount),
            "discount_amount": str(line.discount_amount),
            "net_amount": str(line.net_amount),
            "tax_rate": str(line.tax_rate_snapshot) if line.tax_rate_snapshot is not None else None,
            "tax_amount": str(line.tax_amount),
            "total_amount": str(line.net_amount + line.tax_amount),
        }
        for line in lines
    ]

    return {
        "currency": subscription.currency,
        "plan_summary": plan_summary,
        "lines": invoice_lines,
        "subtotal": str(subscription.subtotal),
        "total_discount": str(subscription.discount_total),
        "total_tax": str(subscription.tax_total),
        "final_total": str(subscription.total),
    }
