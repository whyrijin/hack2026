from django.contrib.auth import authenticate, get_user_model, password_validation
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from uuid import uuid4
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

from customers.models import Customer


def _user_payload(user):
    full_name = user.get_full_name().strip()
    role = 'admin' if user.is_superuser else 'staff' if user.is_staff else 'customer'
    return {
        'id': user.pk,
        'email': user.email,
        'full_name': full_name,
        'name': full_name or user.get_username(),
        'role': role,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'is_active': user.is_active,
    }


def _with_refresh_cookie(response, token, remember_me=False):
    options = {
        'key': 'refresh_token',
        'value': str(token),
        'httponly': True,
        'secure': bool(settings.SESSION_COOKIE_SECURE),
        'samesite': 'Lax',
        'path': '/api/v1/auth/',
    }
    if remember_me:
        options['max_age'] = int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds())
    response.set_cookie(**options)
    return response


def _issue_tokens(user, remember_me=False):
    refresh = RefreshToken.for_user(user)
    response = Response({'access_token': str(refresh.access_token), 'user': _user_payload(user)})
    return _with_refresh_cookie(response, refresh, remember_me)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        password = request.data.get('password', '')
        user = get_user_model().objects.filter(email__iexact=email, is_active=True).first()
        authenticated = authenticate(request, username=user.get_username(), password=password) if user else None
        if authenticated is None:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        return _issue_tokens(authenticated, bool(request.data.get('remember_me', False)))


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        full_name = str(request.data.get('full_name', '')).strip()
        password = request.data.get('password', '')
        if not email or '@' not in email:
            return Response({'email': ['Enter a valid email address.']}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_email(email)
        except ValidationError:
            return Response({'email': ['Enter a valid email address.']}, status=status.HTTP_400_BAD_REQUEST)
        if not full_name:
            return Response({'full_name': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
        user_model = get_user_model()
        if user_model.objects.filter(email__iexact=email).exists():
            return Response({'email': ['An account with this email already exists.']}, status=status.HTTP_400_BAD_REQUEST)
        first_name, _, last_name = full_name.partition(' ')
        candidate = email[:150]
        if user_model.objects.filter(username=candidate).exists():
            candidate = f'{email.split("@")[0][:120]}-{uuid4().hex[:12]}'
        user = user_model(username=candidate, email=email, first_name=first_name[:150], last_name=last_name[:150])
        try:
            password_validation.validate_password(password, user)
        except ValidationError as exc:
            return Response({'password': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        try:
            with transaction.atomic():
                user.save()
                Customer.objects.create(user=user, name=full_name[:200], email=email)
        except IntegrityError:
            return Response({'email': ['An account with this email already exists.']}, status=status.HTTP_400_BAD_REQUEST)
        return _issue_tokens(user, bool(request.data.get('remember_me', False)))


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.COOKIES.get('refresh_token')
        if not raw_token:
            return Response({'detail': 'Refresh session has expired. Sign in again.'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(raw_token)
            user = get_user_model().objects.get(pk=refresh['user_id'], is_active=True)
        except (TokenError, KeyError, get_user_model().DoesNotExist):
            return Response({'detail': 'Refresh session has expired. Sign in again.'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({'access_token': str(refresh.access_token), 'user': _user_payload(user)})


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.COOKIES.get('refresh_token')
        if raw_token:
            try:
                RefreshToken(raw_token).blacklist()
            except TokenError:
                pass
        response = Response({'detail': 'Signed out.'})
        response.delete_cookie('refresh_token', path='/api/v1/auth/')
        return response


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(_user_payload(request.user))
