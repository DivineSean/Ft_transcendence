from rest_framework import serializers
from Auth.serializers import UserSerializer
from .models import Game, GameRoom, Player, PlayerRating
import json


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "name", "min_players", "max_players"]


class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Player
        fields = ["id", "user", "role", "rating_gain", "rating_loss","ready", "score"]


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
        fields = ["id", "game", "status", "created_at", "players", "players_details"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        players_data = representation.get("players_details", [])
        representation["players_details"] = json.dumps(players_data)
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
