from Auth.models import Users
from chat.models import Conversation
from rest_framework import serializers
from django.conf import settings


class UserSerializerOne(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    last_login = serializers.SerializerMethodField()

    def get_profile_image(self, obj):
        if obj.profile_image:
            return f"{settings.MEDIA_URL}{obj.profile_image}"
        return None

    def get_last_login(self, obj):
        if obj.last_login:
            return format(obj.last_login, "%b %d, %Y at %H:%M")
        return None

    class Meta:
        model = Users
        fields = [
            "id",
            "first_name",
            "last_name",
            "username",
            "isOnline",
            "last_login",
            "about",
            "profile_image",
        ]


class ConversationSerializer(serializers.ModelSerializer):
    Sender = UserSerializerOne()
    Receiver = UserSerializerOne()
    latest_message = serializers.CharField()
    latest_message_timestamp = serializers.DateTimeField()
    is_read_message = serializers.BooleanField()

    class Meta:
        model = Conversation
        fields = [
            "ConversationId",
            "Sender",
            "Receiver",
            "latest_message",
            "latest_message_timestamp",
            "is_read_message",
        ]
