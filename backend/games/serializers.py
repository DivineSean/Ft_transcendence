from rest_framework import serializers
from .models import Game, GameRoom, Player, PlayerRating
from Auth.models import Users as User

class GameSerializer(serializers.ModelSerializer):
	class Meta:
		model = Game
		fields = ['id', 'name', 'min_players', 'max_players', 'description']

class PlayerSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = ['id', 'user', 'role', 'score']

class GameRoomSerializer(serializers.ModelSerializer):
	game = GameSerializer(read_only=True)
	players = PlayerSerializer(many=True, source='player_set')

	class Meta:
		model = GameRoom
		fields = ['id', 'game', 'players']
	
	def create(self, validated_data):
		players_data = validated_data.pop('player_set', [])
		game_room = GameRoom.objects.create(**validated_data)
		
		for player_data in players_data:
			Player.objects.create(game_room=game_room, **player_data)
		return game_room

	# def update(self, instance, validated_data):
	# 	# Update fields on the GameRoom instance
	# 	players_data = validated_data.pop('player_set', [])
	# 	instance.game = validated_data.get('game', instance.game)
	# 	instance.save()
	#
	# 	# Update nested players
	# 	for player_data in players_data:
	# 		player_id = player_data.get('id')
	# 		if player_id:
	# 			player = Player.objects.get(id=player_id, game_room=instance)
	# 			player.role = player_data.get('role', player.role)
	# 			player.score = player_data.get('score', player.score)
	# 			player.save()
	# 		else:
	# 			Player.objects.create(game_room=instance, **player_data)
	#
	# 	return instance

class PlayerRatingSerializer(serializers.ModelSerializer):
	class Meta:
		model = PlayerRating
		fields = ['id', 'user', 'game', 'rating', 'updated_at']
