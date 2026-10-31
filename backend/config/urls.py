from django.contrib import admin
from django.urls import include, path
from accounts.views import CurrentUserView, LoginView, LogoutView, RefreshView, RegisterView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/v1/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/v1/auth/refresh/', RefreshView.as_view(), name='auth-refresh'),
    path('api/v1/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/v1/me/', CurrentUserView.as_view(), name='current-user'),
    path('api/v1/', include('subscriptions.urls')),
]
