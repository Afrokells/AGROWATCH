from rest_framework import serializers
from .models import User
from .validators import (
    normalize_and_validate_phone,
    validate_legit_full_name,
    validate_legit_password,
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'phone_number', 'user_role', 'region', 'district', 'profile_picture', 'is_staff', 'is_superuser', 'password']
        extra_kwargs = {'password': {'write_only': True}}
        fields = [
            'id', 'username', 'full_name', 'phone_number', 'user_role',
            'region', 'district', 'profile_picture', 'is_staff', 'is_superuser', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'username': {'required': False},
        }

    def validate_phone_number(self, value):
        normalized = normalize_and_validate_phone(value)
        # Check uniqueness on creation or change
        user_id = self.instance.pk if self.instance else None
        if User.objects.filter(phone_number=normalized).exclude(pk=user_id).exists():
            raise serializers.ValidationError("An account with this phone number already exists.")
        return normalized

    def validate_full_name(self, value):
        if not value and self.instance is None:
            raise serializers.ValidationError("Full name is required.")
        if value:
            return validate_legit_full_name(value)
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        phone = attrs.get('phone_number', getattr(self.instance, 'phone_number', ''))
        name = attrs.get('full_name', getattr(self.instance, 'full_name', ''))

        # Only validate password on registration or explicit change
        if password:
            validate_legit_password(password, phone_number=phone, full_name=name)

        # Ensure region and district are provided for new users
        if not self.instance:
            if not attrs.get('region'):
                raise serializers.ValidationError({"region": "Please select your administrative Region in Ghana."})
            if not attrs.get('district'):
                raise serializers.ValidationError({"district": "Please select your District."})

        # Ensure username matches normalized phone number
        if phone:
            attrs['username'] = phone

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
