from django.urls import path
from .views import SummaryView, RevenueView, OverdueView

urlpatterns = [
    path('reports/summary/', SummaryView.as_view(), name='reports-summary'),
    path('reports/revenue/', RevenueView.as_view(), name='reports-revenue'),
    path('reports/overdue/', OverdueView.as_view(), name='reports-overdue'),
]
