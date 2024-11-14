import json
import asyncio
from channels.consumer import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache
from games.serializers import GameSerializer

QUEUE_KEY = "matchmaking_queue"

from channels.layers import get_channel_layer

class Matchmaker:
    def __init__(self):
        self.queues = {}
        self.loop_running = False
        self.lock = asyncio.Lock()

    async def add_player(self, player_id, channel_name, game_name):

        if game_name not in self.queues:
            self.queues[game_name] = {}

        queue = self.queues[game_name]
        queue[player_id] = channel_name
        cache.set(f"{game_name}_{QUEUE_KEY}", self.queues)

        await self.start_loop()

    async def remove_player(self, player_id, game_name):
        # self.queues = cache.get(QUEUE_KEY, {})
        queue = self.queues.get(game_name, {})
        if player_id in queue:
            del queue[player_id]
            cache.set(f"{game_name}_{QUEUE_KEY}", queue)

    async def start_loop(self):
        async with self.lock:
            if not self.loop_running:
                self.loop_running = True
                asyncio.create_task(self.matchmaking_loop())

    @database_sync_to_async
    def create_game(self, game_data):
        # TODO: handle errors
        serializer = GameSerializer(data=game_data)
        if serializer.is_valid():
            game = serializer.create(serializer.validated_data)

        game_room = {
            'id': str(game.game_id),
            'player_one': str(game.player_one.id),
            'player_two': str(game.player_two.id),
            'type': game.game_type,
        }

        return game_room


    async def matchmaking_loop(self):
        channel_layer = get_channel_layer()

        while any(self.queues.values()):
            for game_name, queue in self.queues.items():
                print("waaaaaaaaaa l5edma hhhhh", flush=True)

                # send updates to every nigga connected
                await channel_layer.group_send(
                    f"{game_name}_matchmaking_group",
                    {
                        "type": "update",
                        "message": len(queue)
                    }
                )
                if len(queue) >= 2:
                    # Pair two players
                    print("waaaaaaaaaa l9it 2 3waaazza hhhhh", flush=True)
                    players = list(queue.items())[:2]
                    player1 = players[0]
                    player2 = players[1]

                    # Create the Game object
                    game_data = {
                        'player_one': player1[0],
                        'player_two': player2[0],
                        'game_type': game_name,
                    }
                    game_room = await self.create_game(game_data)

                    # Notify both players of the match
                    await channel_layer.send(player1[1], {
                        'type': 'match',
                        'message': {
                            'role': 1,
                            'game': game_room
                        }
                    })

                    await channel_layer.send(player2[1], {
                        'type': 'match',
                        'message': {
                            'role': 2,
                            'game': game_room
                        }
                    })

                    # remove l3wazza from the queue
                    for key, value in players:
                        del queue[key]
                    cache.set(f"{game_name}_{QUEUE_KEY}", queue)

            await asyncio.sleep(1)

        async with self.lock:
            self.loop_running = False

matchmaker = Matchmaker()

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

        self.player = self.scope['user'].id
        self.game_name = self.scope['url_route']['kwargs']['game_name']
        print(f"--- game --> {self.game_name}", flush=True)
        self.channel = f"player_{self.player}"
        self.match_found = False
        self.group_name = f"{self.game_name}_matchmaking_group"
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        # Add this nigga to the queue
        await matchmaker.add_player(self.player, self.channel_name, self.game_name)

    async def disconnect(self, code):
        # remove this nigga form the queue
        await matchmaker.remove_player(self.player, self.game_name)
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'update',
            'message': event['message']
        }))

    async def match(self, event):
        await self.send(text_data=json.dumps({
            'type': 'match_found',
            'message': event['message']
        }))
        await self.close()
