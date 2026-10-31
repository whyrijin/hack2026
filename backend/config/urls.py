from django.contrib import admin
from django.urls import include, path
from accounts.recovery import PasswordResetView, PasswordResetConfirmView, PasswordChangeView
from accounts.views import CsrfView, CurrentUserView, LoginView, LogoutView, RefreshView, RegisterView
from customers.views import CustomerListCreateView, CustomerDetailView
from config.catalog_views import (
    PaymentTermCatalogView,
    PlanCatalogView,
    ProductCatalogView,
    QuoteTemplateCatalogView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/csrf/', CsrfView.as_view()),
    path('api/v1/auth/password-reset/', PasswordResetView.as_view()),
    path('api/v1/auth/password-reset/confirm/', PasswordResetConfirmView.as_view()),
    path('api/v1/auth/password-change/', PasswordChangeView.as_view()),
    path('api/v1/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/v1/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/v1/auth/refresh/', RefreshView.as_view(), name='auth-refresh'),
    path('api/v1/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/v1/me/', CurrentUserView.as_view(), name='current-user'),
    path('api/v1/customers/', CustomerListCreateView.as_view(), name='customer-catalog'),
    path('api/v1/customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
    path('api/v1/plans/', PlanCatalogView.as_view(), name='plan-catalog'),
    path('api/v1/products/', ProductCatalogView.as_view(), name='product-catalog'),
    path('api/v1/quote-templates/', QuoteTemplateCatalogView.as_view(), name='quote-template-catalog'),
    path('api/v1/payment-terms/', PaymentTermCatalogView.as_view(), name='payment-term-catalog'),
    path('api/v1/', include('subscriptions.urls')),
    path('api/v1/', include('analytics.urls')),
]
