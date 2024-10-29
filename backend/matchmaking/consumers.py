import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from channels.utils import await_many_dispatch
from django.core.cache import cache

QUEUE_KEY = "matchmaking_queue"

from channels.layers import get_channel_layer

class Matchmaker:
    def __init__(self):
        self.queue = {}
        self.loop_running = False
        self.lock = asyncio.Lock()

    async def add_player(self, player_id, channel_name):
        self.queue = cache.get(QUEUE_KEY, {})
        self.queue[player_id] = channel_name
        cache.set(QUEUE_KEY, self.queue)
        await self.start_loop()

    async def remove_player(self, player_id):
        self.queue = cache.get(QUEUE_KEY, {})
        if player_id in self.queue:
            del self.queue[player_id]
            cache.set(QUEUE_KEY, self.queue)

    async def start_loop(self):
        async with self.lock:
            if not self.loop_running:
                self.loop_running = True
                asyncio.create_task(self.matchmaking_loop())

    async def matchmaking_loop(self):
        channel_layer = get_channel_layer()

        while self.queue:
            print("waaaaaaaaaa l5edma hhhhh", flush=True)

            # send updates to every nigga connected
            await channel_layer.group_send(
                "matchmaking_group",
                {
                    "type": "update",
                    "message": len(self.queue)
                }
            )
            if len(self.queue) >= 2:
                # Pair two players
                print("waaaaaaaaaa l9it 2 3waaazza hhhhh", flush=True)
                players = list(self.queue.items())[:2]
                player1 = players[0]
                player2 = players[1]
                match_id = f"match_{player1[0]}_{player2[0]}"

                # Notify both players of the match
                await channel_layer.send(player1[1], {
                    'type': 'match',
                    'message': {
                        'role': 1,
                        'match_id': match_id,
                        'player1': player1[0],
                        'player2': player2[0],
                    }
                })

                await channel_layer.send(player2[1], {
                    'type': 'match',
                    'message': {
                        'role': 2,
                        'match_id': match_id,
                        'player1': player1[0],
                        'player2': player2[0],
                    }
                })

                # remove l3wazza from the queue
                for key, value in players:
                    del self.queue[key]
                cache.set(QUEUE_KEY, self.queue)

            await asyncio.sleep(1)

        async with self.lock:
            self.loop_running = False

matchmaker = Matchmaker()

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

        self.player = self.scope['user'].id
        self.channel = f"player_{self.player}"
        self.match_found = False
        await self.channel_layer.group_add("matchmaking_group", self.channel_name)

        # Add this nigga to the queue
        await matchmaker.add_player(self.player, self.channel_name)

    async def disconnect(self, code):
        # remove this nigga form the queue
        await matchmaker.remove_player(self.player)
        await self.channel_layer.group_discard("matchmaking_group", self.channel_name)

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
