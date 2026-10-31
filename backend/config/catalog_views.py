"""Read-only, permission-scoped catalog endpoints used by the web workspace."""

from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from customers.models import Customer
from plans.models import PaymentTerm, Plan
from products.models import Product
from quotations.models import QuoteTemplate


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
