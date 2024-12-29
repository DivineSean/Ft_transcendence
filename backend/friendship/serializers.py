from rest_framework import serializers
from .models import Friendship, FriendshipRequest
from authentication.models import User


class UserData(serializers.Serializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
        ]


class FriendshipRequestSerializer(serializers.Serializer):
    fromUser = UserData(read_only=True)
    toUser = UserData(read_only=True)

    class Meta:
        model = FriendshipRequest
        fields = ["id", "fromUser", "toUser", "created_at"]


class UserFriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]
