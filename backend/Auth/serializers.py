from rest_framework import serializers
from .models import Users
from django.conf import settings
from chat.models import Conversation
from django.core.exceptions import ValidationError


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["id", "first_name", "last_name", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class PasswordUpdateSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, required=True)

    def update(self, instance, validated_data):
        instance.set_password(validated_data["new_password"])
        instance.save()
        return instance


class RegisterOAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["id", "first_name", "last_name", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format="hex_verbose")
    profile_image = serializers.SerializerMethodField()

    def get_profile_image(self, obj):
        if obj.profile_image:
            return f"{settings.MEDIA_URL}{obj.profile_image}"
        return None

    def update(self, validated_data):
        instance = self.Meta.model(**validated_data)
        instance.save()
        return instance

    class Meta:
        model = Users
        fields = "__all__"
        extra_kwargs = {"profile_image": {"required": False}}
        extra_kwargs = {"password": {"write_only": True}}


class UserFriendSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format="hex_verbose")
    profile_image = serializers.SerializerMethodField()

    def get_profile_image(self, obj):
        if obj.profile_image:
            return f"{settings.MEDIA_URL}{obj.profile_image}"
        return None

    class Meta:
        model = Users
        fields = [
            "first_name",
            "last_name",
            "id",
            "username",
            "profile_image",
            "isOnline",
        ]
        extra_kwargs = {"profile_image": {"required": False}}
        extra_kwargs = {"password": {"write_only": True}}


class UpdateUserSerializer(serializers.ModelSerializer):
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if value is not None:
                setattr(instance, attr, value)
        instance.save()
        return instance

    class Meta:
        model = Users
        fields = ["first_name", "last_name", "about", "isTwoFa"]
        extra_kwargs = {
            "profile_image": {"required": False},
            "password": {"write_only": True},
        }
