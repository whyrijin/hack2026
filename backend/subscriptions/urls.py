from django.urls import path

from .views import (
    PortalSubscriptionActionView,
    PortalSubscriptionDetailView,
    PortalSubscriptionListView,
    SubscriptionActionView,
    SubscriptionDetailView,
    SubscriptionListCreateView,
)

urlpatterns = [
    path('subscriptions/', SubscriptionListCreateView.as_view(), name='subscription-list'),
    path('subscriptions/<uuid:pk>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('subscriptions/<uuid:pk>/<str:action>/', SubscriptionActionView.as_view(), name='subscription-action'),
    path('portal/subscriptions/', PortalSubscriptionListView.as_view(), name='portal-subscription-list'),
    path('portal/subscriptions/<uuid:pk>/', PortalSubscriptionDetailView.as_view(), name='portal-subscription-detail'),
    path('portal/subscriptions/<uuid:pk>/<str:action>/', PortalSubscriptionActionView.as_view(), name='portal-subscription-action'),
]
