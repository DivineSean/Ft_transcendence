from authentication.models import User
from chat.models import Conversation
from rest_framework import serializers
from django.conf import settings


class UserSerializerOne(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    last_login = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()

    def get_level(self, obj):
        return obj.get_levels()

    def get_percentage(self, obj):
        return obj.get_percentage()

    def get_profile_image(self, obj):
        if obj.profile_image:
            return f"{settings.MEDIA_URL}{obj.profile_image}"
        return None

    def get_last_login(self, obj):
        if obj.last_login:
            return format(obj.last_login, "%b %d, %Y at %H:%M")
        return None

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "username",
            "last_login",
            "about",
            "profile_image",
            "exp",
            "level",
            "percentage",
            "status",
        ]


class ConversationSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    latest_message = serializers.CharField()
    latest_message_timestamp = serializers.DateTimeField()
    is_read_message = serializers.BooleanField()

    class Meta:
        model = Conversation
        fields = [
            "ConversationId",
            "user",
            "latest_message",
            "latest_message_timestamp",
            "is_read_message",
        ]

    def __init__(self, *args, **kwargs):
        exclude_fields = kwargs.pop("exclude_fields", [])
        super().__init__(*args, **kwargs)

        for field in exclude_fields:
            self.fields.pop(field, None)

    def get_user(self, obj):
        current_user = self.context["request"].user

        if obj.Sender == current_user:
            return UserSerializerOne(obj.Receiver).data
        return UserSerializerOne(obj.Sender).data
