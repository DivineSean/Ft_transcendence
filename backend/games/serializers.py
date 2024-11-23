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
		fields = ['id', 'user', 'role', 'score']

class PlayerRatingSerializer(serializers.ModelSerializer):
	class Meta:
		model = PlayerRating
		fields = ['id', 'user', 'game', 'rating', 'updated_at']

class GameRoomSerializer(serializers.ModelSerializer):
	game = serializers.PrimaryKeyRelatedField(queryset=Game.objects.all())
	players = serializers.ListField(
		child=serializers.UUIDField(),
		write_only=True
	)
	players_details = PlayerSerializer(many=True, read_only=True, source='player_set')

	class Meta:
		model = GameRoom
		fields = ['id', 'game', 'players', 'players_details']
	
	def create(self, validated_data):
		user_ids = validated_data.pop('players')

		game_room = GameRoom.objects.create(**validated_data)

		for user in user_ids:
			Player.objects.create(
				user_id=user,
				game_room=game_room,
				# role='0',
			)
		return game_room
