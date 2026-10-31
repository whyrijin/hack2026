"""Invalidate bearer tokens as soon as the account password changes."""
from django.utils.crypto import constant_time_compare, salted_hmac
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed


def password_stamp(user):
    return salted_hmac('brightloop.jwt.password', user.password).hexdigest()


class AccountJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if not constant_time_compare(validated_token.get('password_stamp', ''), password_stamp(user)):
            raise AuthenticationFailed('Your session has changed. Please sign in again.')
        return user
