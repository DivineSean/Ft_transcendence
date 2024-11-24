from uuid import UUID
from rest_framework import serializers
from .models import Game, GameRoom, Player, PlayerRating
from Auth.models import Users as User

class GameSerializer(serializers.ModelSerializer):
	class Meta:
		model = Game
		fields = ['id', 'name', 'min_players', 'max_players', 'description']

class PlayerSerializer(serializers.ModelSerializer):
	user = serializers.UUIDField(format='hex_verbose')

	class Meta:
		model = Player
		fields = ['id', 'user', 'role', 'rating_gain', 'rating_loss','score']

class PlayerRatingSerializer(serializers.ModelSerializer):
	class Meta:
		model = PlayerRating
		fields = ['id', 'user', 'game', 'rating', 'updated_at']

class GameRoomSerializer(serializers.ModelSerializer):
	game = serializers.PrimaryKeyRelatedField(queryset=Game.objects.all())
	players = serializers.ListField(
		child=serializers.DictField(),
		write_only=True
	)
	players_details = PlayerSerializer(many=True, read_only=True, source='player_set')

	class Meta:
		model = GameRoom
		fields = ['id', 'game', 'players', 'players_details']
	
	def create(self, validated_data):
		users = validated_data.pop('players')

		game_room = GameRoom.objects.create(**validated_data)

		for user in users:
			Player.objects.create(
				user_id=user['id'],
				game_room=game_room,
				role=user['role'],
				rating_gain=user['rating_gain'],
				rating_loss=user['rating_loss'],
			)

		return game_room
