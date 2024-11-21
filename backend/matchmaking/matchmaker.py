from asgiref.sync import async_to_sync
from channels.consumer import database_sync_to_async
from django.db.models.base import sync_to_async
from games.serializers import GameSerializer
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

class Matchmaker:
	def __init__(self):
		self.queues = {}
		self.timers = {}
		self.loop_running = False
		self.lock = asyncio.Lock()

	async def add_player(self, player_id, channel_name, game_name, rating):

		if game_name not in self.queues:
			self.queues[game_name] = RATING_TOLERANCE_BASELINE
			self.timers[game_name] = time.time()

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
	def create_game(self, game_data):
		serializer = GameSerializer(data=game_data)
		game_room = None
		if serializer.is_valid():
			game = serializer.create(serializer.validated_data)

			game_room = {
				'id': str(game.game_id),
				'player_one': str(game.player_one.id),
				'player_two': str(game.player_two.id),
				'type': game.game_type,
			}

		return game_room

	def create_batches(self, players, rating_tolerance):
		print("----------------------------------------------------------------", flush=True)
		print(players, flush=True)
		batches = []
		batch = []

		current_rating = None
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

	def find_matches(self, batches, game_name):
		matches = []

		for batch in batches:
			print(batch, flush=True)

			while len(batch) >= 2:
				player_one = batch.pop()
				player_two = batch.pop()
				matches.append([player_one, player_two])
				r.zrem(f"{game_name}_{QUEUE_KEY}", player_one[0], player_two[0])
				print(f"-----------------------> {player_one[0]} vs {player_two[0]}", flush=True)

		return matches

	async def create_matches(self, channel_layer, game_name, matches):
		for match in matches:
			player_one = match.pop()
			player_two = match.pop()
			channel_one = r.hget(f"{game_name}:players_channel_names", player_one[0]).decode('utf-8')
			channel_two = r.hget(f"{game_name}:players_channel_names", player_two[0]).decode('utf-8')

			game_room = await self.create_game({
				'player_one': player_one[0].decode('utf-8'),
				'player_two': player_two[0].decode('utf-8'),
				'game_type': game_name
			})

			if game_room:
				# Notify players of the match
				await channel_layer.send(channel_one, {
					'type': 'match',
					'message': {
						'role': 1,
						'game': game_room
					}
				})
				await channel_layer.send(channel_two, {
					'type': 'match',
					'message': {
						'role': 2,
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
		# TODO: Rework the games models and relations
		while len(self.queues):
			print("waaaaaaaaaa l5edma hhhhh", flush=True)
			for game_name, rating_tolerance in self.queues.items():
				print(f"{game_name} --> {rating_tolerance}", flush=True)
				players = r.zrange(f"{game_name}_{QUEUE_KEY}", 0, -1, withscores=True)
				await self.send_updates(channel_layer, game_name, len(players))
				if len(players) == 0:
					del self.queues[game_name]
					break
				batches = self.create_batches(players, rating_tolerance)
				matches = self.find_matches(batches, game_name)
				await self.create_matches(channel_layer,game_name, matches)

				if time.time() - self.timers[game_name] >= 30:
					self.timers[game_name] = time.time()
					self.queues[game_name] += TOLERANCE_EXPANSION_RATE
				await asyncio.sleep(1)


		async with self.lock:
			self.loop_running = False
