"""Read-only, permission-scoped catalog endpoints used by the web workspace."""

from datetime import date

from rest_framework.exceptions import PermissionDenied
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from customers.models import Customer
from plans.models import PaymentTerm, Plan
from products.models import Product
from quotations.models import QuoteTemplate
from discounts.models import DiscountRule
from products.models import ProductVariant, TaxRule
from products.services.catalog_adapter import calculate_price


class CatalogPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100


def _paginate(view, request, queryset, serialize):
    paginator = CatalogPagination()
    page = paginator.paginate_queryset(queryset, request, view=view)
    return paginator.get_paginated_response([serialize(item) for item in page])


def _staff_only(user):
    if not (user.is_staff or user.is_superuser):
        raise PermissionDenied("Authorized staff access is required.")


class CustomerCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _staff_only(request.user)
        queryset = Customer.objects.order_by("name", "id")
        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(email__icontains=search) | queryset.filter(company__icontains=search)
        return _paginate(self, request, queryset.distinct(), lambda customer: {
            "id": customer.pk,
            "name": customer.name,
            "company": customer.company,
            "email": customer.email,
        })


class PlanCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Plan.objects.filter(is_active=True).select_related("payment_term").order_by("name", "id")
        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(name__icontains=search)
        return _paginate(self, request, queryset, lambda plan: {
            "id": plan.pk,
            "name": plan.name,
            "cadence": plan.cadence,
            "base_price": str(plan.base_price),
            "minimum_quantity": plan.minimum_quantity,
            "availability_start_date": plan.available_from.isoformat(),
            "availability_end_date": plan.available_until.isoformat() if plan.available_until else None,
            "payment_term_days": plan.payment_term.days_until_due if plan.payment_term_id else 0,
        })


class ProductCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Product.objects.filter(is_active=True).prefetch_related("variants").order_by("name", "id")
        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(name__icontains=search)
        return _paginate(self, request, queryset, lambda product: {
            "id": product.pk,
            "name": product.name,
            "type": product.type,
            "sales_price": str(product.sales_price),
            "variants": [
                {
                    "id": variant.pk,
                    "label": f"{variant.attribute_label}: {variant.option_value}",
                    "price_adjustment": str(variant.price_adjustment),
                }
                for variant in product.variants.all()
                if variant.is_active
            ],
        })


class QuoteTemplateCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = QuoteTemplate.objects.filter(is_active=True, plan__is_active=True).select_related(
            "plan", "payment_term"
        ).prefetch_related("lines").order_by("name", "id")
        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(name__icontains=search)
        return _paginate(self, request, queryset, lambda template: {
            "id": template.pk,
            "name": template.name,
            "plan_id": template.plan_id,
            "validity_days": template.validity_days,
            "payment_term_days": template.payment_term.days_until_due if template.payment_term_id else (
                template.plan.payment_term.days_until_due if template.plan.payment_term_id else 0
            ),
            "default_lines": template.default_lines,
        })


class PaymentTermCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = PaymentTerm.objects.filter(is_active=True).order_by("days_until_due", "name")
        return _paginate(self, request, queryset, lambda term: {
            "id": term.pk,
            "name": term.name,
            "days_until_due": term.days_until_due,
        })


def _product_payload(product):
    return {
        "id": product.pk,
        "name": product.name,
        "type": product.type,
        "sales_price": str(product.sales_price),
        "variants": [
            {
                "id": variant.pk,
                "label": f"{variant.attribute_label}: {variant.option_value}",
                "price_adjustment": str(variant.price_adjustment),
            }
            for variant in product.variants.filter(is_active=True).order_by("attribute_label", "option_value", "id")
        ],
    }


class ProductDetailCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            product = Product.objects.prefetch_related("variants").get(pk=pk, is_active=True)
        except Product.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Product not found.")
        return Response(_product_payload(product))


class ProductVariantCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, is_active=True)
        except Product.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Product not found.")
        return _paginate(self, request, ProductVariant.objects.filter(product=product, is_active=True).order_by("attribute_label", "option_value", "id"), lambda variant: {
            "id": variant.pk,
            "product_id": product.pk,
            "attribute_label": variant.attribute_label,
            "option_value": variant.option_value,
            "label": f"{variant.attribute_label}: {variant.option_value}",
            "price_adjustment": str(variant.price_adjustment),
        })


def _plan_payload(plan):
    return {
        "id": plan.pk,
        "name": plan.name,
        "cadence": plan.billing_cadence,
        "base_price": str(plan.base_price),
        "minimum_quantity": plan.minimum_quantity,
        "availability_start_date": plan.availability_start_date.isoformat(),
        "availability_end_date": plan.availability_end_date.isoformat() if plan.availability_end_date else None,
        "allow_pause": plan.allow_pause,
        "allow_early_close": plan.allow_early_closure,
        "allow_renewal": plan.allow_renewal,
        "auto_close": plan.auto_close,
        "payment_term_days": plan.payment_term.days_until_due if plan.payment_term_id else 0,
    }


class PlanDetailCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            plan = Plan.objects.select_related("payment_term").get(pk=pk, is_active=True)
        except Plan.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Plan not found.")
        return Response(_plan_payload(plan))


class QuoteTemplateDetailCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            template = QuoteTemplate.objects.select_related("plan", "payment_term").prefetch_related("lines").get(
                pk=pk, is_active=True, plan__is_active=True
            )
        except QuoteTemplate.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Quotation template not found.")
        return Response({
            "id": template.pk,
            "name": template.name,
            "plan_id": template.plan_id,
            "validity_days": template.validity_days,
            "payment_term_days": template.payment_term.days_until_due if template.payment_term_id else (
                template.plan.payment_term.days_until_due if template.plan.payment_term_id else 0
            ),
            "default_lines": template.default_lines,
        })


class TaxCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _staff_only(request.user)
        queryset = TaxRule.objects.filter(is_active=True).order_by("name", "id")
        return _paginate(self, request, queryset, lambda tax: {
            "id": tax.pk,
            "name": tax.name,
            "percentage_rate": str(tax.percentage_rate),
        })


class DiscountCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _staff_only(request.user)
        queryset = DiscountRule.objects.filter(is_active=True).prefetch_related("products").order_by("name", "id")
        return _paginate(self, request, queryset, lambda rule: {
            "id": str(rule.pk),
            "code": rule.code or "",
            "name": rule.name,
            "discount_type": rule.discount_type,
            "value": str(rule.value),
            "scope": rule.scope,
            "min_order_amount": str(rule.min_order_amount) if rule.min_order_amount is not None else None,
            "minimum_quantity": rule.minimum_quantity,
            "max_discount_cap": str(rule.max_discount_cap) if rule.max_discount_cap is not None else None,
            "valid_from": rule.valid_from.isoformat(),
            "valid_to": rule.valid_to.isoformat() if rule.valid_to else None,
            "remaining_uses": None if rule.max_uses is None else max(0, rule.max_uses - rule.times_used - rule.times_reserved),
            "product_ids": list(rule.products.values_list("id", flat=True)),
        })


class PricingPreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        _staff_only(request.user)
        try:
            plan = Plan.objects.select_related("payment_term").prefetch_related("taxes").get(
                pk=request.data.get("plan_id"), is_active=True
            )
        except (Plan.DoesNotExist, TypeError, ValueError):
            raise ValidationError({"plan_id": "Select an active plan."})
        effective_date = request.data.get("effective_date")
        try:
            if isinstance(effective_date, date):
                parsed_date = effective_date
            else:
                parsed_date = date.fromisoformat(str(effective_date))
        except (TypeError, ValueError):
            raise ValidationError({"effective_date": "Use YYYY-MM-DD."})
        lines = request.data.get("lines")
        if not isinstance(lines, list):
            raise ValidationError({"lines": "Provide a list of product lines."})
        return Response(calculate_price(plan=plan, lines=lines, effective_date=parsed_date))
