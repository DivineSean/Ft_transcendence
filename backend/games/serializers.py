from rest_framework import serializers
from .models import Game, GameRoom, Player, PlayerRating
from Auth.models import Users as User
import json


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "name", "min_players", "max_players"]


class PlayerSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = ["id", "user", "role", "rating_gain",
                  "rating_loss", "ready", "score", "result", "timeouts"]

    def get_user(self, obj):
        from Auth.serializers import UserSerializer

        user_serializer = UserSerializer(obj.user).data
        return {
            "id": user_serializer.get("id"),
            "username": user_serializer.get("username"),
            "profile_image": user_serializer.get("profile_image"),
        }


class PlayerRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerRating
        fields = ["id", "user", "game", "rating", "updated_at"]


class GameRoomSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format="hex_verbose", read_only=True)
    game = serializers.PrimaryKeyRelatedField(queryset=Game.objects.all())
    players = serializers.ListField(
        child=serializers.DictField(), required=False)

    class Meta:
        model = GameRoom
        fields = [
            "id",
            "game",
            "status",
            "state",
            "created_at",
            "players",
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        state = representation.get("state", {})
        players_data = PlayerSerializer(instance.player_set, many=True).data
        representation["players"] = json.dumps(players_data)
        representation["state"] = json.dumps(state)
        return representation

    def validate_players(self, value):
        for player_data in value:
            if "user" not in player_data or "role" not in player_data:
                raise serializers.ValidationError(
                    "Each player must include a 'user' and 'role' field."
                )
        return value

    def create(self, validated_data):
        users = validated_data.pop("players", [])

        game_room = GameRoom.objects.create(**validated_data)

        for user in users:
            Player.objects.create(
                user_id=user["user"],
                game_room=game_room,
                role=user["role"],
                rating_gain=user.get("rating_gain", 0),
                rating_loss=user.get("rating_loss", 0),
            )
        return game_room

    def update(self, instance, validated_data):
        instance.status = validated_data.get("status", instance.status)
        instance.state = validated_data.get("state", instance.state)
        instance.save()

        players_data = validated_data.get("players", [])
        for player_data in players_data:
            player_id = player_data.get("id")
            if not player_id:
                continue

            try:
                player = instance.player_set.get(id=player_id)
                for field, value in player_data.items():
                    if field not in ["id", "user"]:
                        setattr(player, field, value)
                player.save()
            except Player.DoesNotExist:
                user_id = player_data.get("user", {}).get(
                    "id")
                if not user_id or not User.objects.filter(id=user_id).exists():
                    raise serializers.ValidationError(
                        f"User with id {user_id} does not exist."
                    )
                Player.objects.create(
                    user_id=user_id,
                    game_room=instance,
                    role=player_data.get("role", "default"),
                    rating_gain=player_data.get("rating_gain", 0),
                    rating_loss=player_data.get("rating_loss", 0),
                )

        return instance
