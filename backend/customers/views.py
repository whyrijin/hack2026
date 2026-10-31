from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from django.db.models import Q
from config.catalog_views import CatalogPagination
from .models import Customer
from .serializers import CustomerSerializer


class CustomerListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CustomerSerializer
    pagination_class = CatalogPagination

    def get_queryset(self):
        queryset = Customer.objects.order_by('name', 'id')
        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(email__icontains=search) | Q(company__icontains=search))
        return queryset


class CustomerDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()
    http_method_names = ['get', 'patch', 'head', 'options']
