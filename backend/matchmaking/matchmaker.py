from asgiref.sync import async_to_sync
from channels.consumer import database_sync_to_async
from django.db.models.base import sync_to_async
from games.models import Game
from games.serializers import GameRoomSerializer, GameSerializer
from channels.layers import get_channel_layer
from django.conf import settings
import redis
import time
import asyncio

r = redis.StrictRedis(
	host=settings.REDIS_CONNECTION['host'],
	port=settings.REDIS_CONNECTION['port'],
	password=settings.REDIS_CONNECTION['password'],
	db=settings.REDIS_CONNECTION['db']
	)

QUEUE_KEY = "matchmaking_queue"
RATING_TOLERANCE_BASELINE = 0
TOLERANCE_EXPANSION_RATE = 50
TOLERANCE_EXPANSION_TIME = 20

class Matchmaker:
	def __init__(self):
		self.queues = {}
		self.loop_running = False
		self.lock = asyncio.Lock()

	async def add_player(self, player_id, channel_name, game_name, rating):

		if game_name not in self.queues:
			try:
				game = await database_sync_to_async(Game.objects.get)(name=game_name)
				serializer = GameSerializer(game)
				res = {key: value for key, value in serializer.data.items() if key in ['id', 'name', 'min_players', 'max_players']}
				self.queues[game_name] = res
				self.queues[game_name]['rating_tolerance'] = RATING_TOLERANCE_BASELINE
				self.queues[game_name]['timer'] = time.time()
				print(f"-------------> {self.queues[game_name]}", flush=True)
			except Exception as e:
				print(e, flush=True)
				raise

		r.zadd(f"{game_name}_{QUEUE_KEY}", {player_id: rating})
		r.hset(f"{game_name}:players_channel_names", mapping={player_id: channel_name})
		await self.start_loop()

	async def remove_player(self, player_id, game_name):
		r.zrem(f"{game_name}_{QUEUE_KEY}", player_id)
		r.hdel(f"{game_name}:players_channel_names", player_id)

	async def start_loop(self):
		async with self.lock:
			if not self.loop_running:
				self.loop_running = True
				asyncio.create_task(self.matchmaking_loop())

	@database_sync_to_async
	def create_game(self, game_id, players):
		game_data = {
			'game': game_id,
			'players': players
		}
		serializer = GameRoomSerializer(data=game_data)
		game_room = None
		if serializer.is_valid():
			game = serializer.create(serializer.validated_data)
			serialized = GameRoomSerializer(game)
			game_room = serialized.data
			print(game_room, flush=True)
		return game_room

	def create_batches(self, players, rating_tolerance):
		print("----------------------------------------------------------------", flush=True)
		print(players, flush=True)
		batches = []
		batch = []

		current_rating = None
		# BUG: Fix users getting matched regardless of the rating_tolerance
		for player, rating in players:
			print(f"------------> {player} [{rating}]", flush=True)
			print(f"------------> {current_rating}", flush=True)
			if not current_rating:
				current_rating = rating

			if abs(current_rating - rating) > rating_tolerance:
				batches.append(batch)
				batch = []
				current_rating = rating

			batch.append((player, rating))
			

		if batch:
			batches.append(batch)

		print(batches, flush=True)
		print("----------------------------------------------------------------", flush=True)
		return batches

	def find_matches(self, batches, game):
		matches = []
		match = []

		for batch in batches:
			print(batch, flush=True)

			for player, rating in batch:
				if len(match) < game['max_players']:
					match.append(player.decode('utf-8'))

				if len(match) == game['max_players']:
					matches.append(match)
					match = []

			if len(match) >= game['min_players']:
				matches.append(match)
				match = []

		# print(f"-------- matches --> {matches}", flush=True)
		return matches

	async def create_matches(self, channel_layer, game, matches):
		for match in matches:
			channels = []
			for player in match:
				r.zrem(f"{game['name']}_{QUEUE_KEY}", player)
				channel = r.hget(f"{game['name']}:players_channel_names", player)
				channels.append(channel.decode('utf-8'))

			game_room = await self.create_game(game['id'], match)
			if game_room:
				# Notify all players
				print("---------> Here", flush=True)
				for i in range(0, len(channels)):
					await channel_layer.send(channels[i], {
						'type': 'match',
						'message': {
							'role': i,
							'game': game_room
						}
					})

	async def send_updates(self, channel_layer, game_name, message):
		await channel_layer.group_send(f"{game_name}_matchmaking_group", {
			'type': 'update',
			'message': message
		})

	async def matchmaking_loop(self):
		channel_layer = get_channel_layer()

		# TODO: Add per-player estimated time
		# TODO: Calculate ELO gain/loss per-player
		while len(self.queues):
			print("waaaaaaaaaa l5edma hhhhh", flush=True)
			for _, game in self.queues.items():
				print(game, flush=True)
				print(f"{game['name']} --> {game['rating_tolerance']}", flush=True)
				players = r.zrange(f"{game['name']}_{QUEUE_KEY}", 0, -1, withscores=True)
				# await self.send_updates(channel_layer, game_name, len(players))
				if len(players) == 0:
					del self.queues[game['name']]
					break
				batches = self.create_batches(players, game['rating_tolerance'])
				matches = self.find_matches(batches, game)
				await self.create_matches(channel_layer,game, matches)

				if matches:
					game['timer'] = time.time()
				elif time.time() - game['timer'] >= TOLERANCE_EXPANSION_TIME:
					game['timer'] = time.time()
					game['rating_tolerance'] += TOLERANCE_EXPANSION_RATE
				await asyncio.sleep(1)


		async with self.lock:
			self.loop_running = False
