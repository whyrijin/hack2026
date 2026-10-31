import json
from rest_framework import serializers
from .models import Customer


class AddressField(serializers.Field):
    def to_representation(self, value):
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, dict) else value
        except (ValueError, TypeError):
            return value

    def to_internal_value(self, data):
        if isinstance(data, dict) and all(isinstance(v, str) for v in data.values()):
            if len(json.dumps(data)) > 4000:
                raise serializers.ValidationError('Address is too long.')
            return json.dumps(data)
        if isinstance(data, str) and len(data) <= 4000:
            return data
        raise serializers.ValidationError('Use an address string or an object of address fields.')


class CustomerSerializer(serializers.ModelSerializer):
    billing_address = AddressField(required=False)

    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'company', 'phone', 'billing_address', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_email(self, value):
        return value.strip().lower()

    def to_internal_value(self, data):
        unknown = set(data) - set(self.fields)
        if unknown:
            raise serializers.ValidationError({key: 'This field is not editable.' for key in unknown})
        return super().to_internal_value(data)
