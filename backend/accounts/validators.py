"""Password rules shared by registration and Django admin-created accounts."""

import string

from django.core.exceptions import ValidationError


class StrongPasswordValidator:
    def validate(self, password, user=None):
        if not any(character.islower() for character in password):
            raise ValidationError("Password must contain a lowercase letter.", code="password_no_lowercase")
        if not any(character.isupper() for character in password):
            raise ValidationError("Password must contain an uppercase letter.", code="password_no_uppercase")
        if not any(character in string.punctuation for character in password):
            raise ValidationError("Password must contain a special character.", code="password_no_special")

    def get_help_text(self):
        return "Your password must include lowercase and uppercase letters and a special character."
