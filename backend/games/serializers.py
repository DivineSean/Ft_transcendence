from rest_framework import serializers
from .models import Game, GameRoom, Player, PlayerRating
import json


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "name", "min_players", "max_players"]


class PlayerSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = [
            "id",
            "user",
            "role",
            "rating_gain",
            "rating_loss",
            "ready",
            "score",
            "result",
        ]

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
    players = serializers.ListField(child=serializers.DictField(), write_only=True)
    players_details = PlayerSerializer(many=True, read_only=True, source="player_set")

    class Meta:
        model = GameRoom
        fields = [
            "id",
            "game",
            "status",
            "state",
            "created_at",
            "players",
            "players_details",
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        players_data = representation.get("players_details", [])
        state = representation.get("state", {})
        representation["players_details"] = json.dumps(players_data)
        representation["state"] = json.dumps(state)
        return representation

    def create(self, validated_data):
        users = validated_data.pop("players")

        game_room = GameRoom.objects.create(**validated_data)

        for user in users:
            Player.objects.create(
                user_id=user["id"],
                game_room=game_room,
                role=user["role"],
                rating_gain=user["rating_gain"],
                rating_loss=user["rating_loss"],
            )
        return game_room

    def update(self, instance, validated_data):
        instance.status = validated_data.get("status", instance.status)
        instance.state = validated_data.get("state", instance.state)
        instance.save()

        players_details = validated_data.get("players_details", [])
        for player_data in players_details:
            player_id = player_data.get("id")
            if not player_id:
                continue

            try:
                player = instance.player_set.get(id=player_id)
            except Player.DoesNotExist:
                continue

            player.ready = player_data.get("ready", player.ready)
            player.score = player_data.get("score", player.score)
            player.save()

        return instance
