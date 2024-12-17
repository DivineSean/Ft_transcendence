from channels.consumer import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import asyncio
from rest_framework.serializers import ValidationError
from games.serializers import GameRoomSerializer, PlayerSerializer
from django.conf import settings
from .models import GameRoom
import json
import redis

r = redis.Redis(
    host=settings.REDIS_CONNECTION["host"],
    port=settings.REDIS_CONNECTION["port"],
    password=settings.REDIS_CONNECTION["password"],
    db=settings.REDIS_CONNECTION["db"],
    decode_responses=True,
)

ACCEPT_DEADLINE=1000

class GameConsumer(AsyncWebsocketConsumer):
    async def broadcast_game_accept(self, game_state):
        await self.send(
            text_data=json.dumps({"type": "accept", "message": game_state})
        )
        pass

    async def connect_player(self):
        # INFO:
        # if one of the players isnt ready, send accept_match event
        # else if the player is reconnecting send reconneting event
        # WARNING: still have to handle spectators (players not taking part of the game)
        try:
            # WARNING: the data is all manipulated in redis atm, will implement presistent data later
            game_state = r.hgetall(f"game_room_state:{self.game_uuid}")
            if game_state is None:
                game = await database_sync_to_async(GameRoom.objects.get)(pk=self.game_uuid)
                serializer = GameRoomSerializer(game)
                serialized_game = serializer.data
                r.hset(f"game_room_state:{self.game_uuid}", mapping=serialized_game)
        except Exception as e:
            await self.close(code=1006, reason=e)
            return

        print(" game_state ---------------> ", game_state, flush=True)
        self.players = json.loads(game_state["players_details"])
        print(" game_state ---------------> ",flush=True)
        # match game_state["status"]:
        #     case "waiting":
        #         print("accepting phase", flush=True)
        await self.broadcast_game_accept(game_state)

    async def connect(self):
        await self.accept()
        self.user_id = str(self.scope["user"].id)
        self.game_uuid = self.scope["url_route"]["kwargs"]["room_uuid"]
        self.group_name = f"game_room_{self.game_uuid}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.connect_player()

        # self.pubsub = r.pubsub()
        # self.pubsub.psubscribe(f"__keyevent@{settings.REDIS_CONNECTION['db']}__:expired")
        # asyncio.create_task(self.listen_for_expiry())


    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.group_name, self.channel_name
        )

    async def receive(self, text_data):
        isPlayer = any(player["user"]["id"] == self.user_id for player in self.players)
        if not isPlayer:
            return

        try:
            data = json.loads(text_data)
            type = data["type"]
            message = data["message"]
        except (json.JSONDecodeError, KeyError):
            print("------------------> nn hh", flush=True)
            return

        match type:
            case "score":
                await self.update_score()
            case "update":
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "whisper",
                        "info": "update",
                        "sender": self.channel_name,
                        "message": message,
                    },
                )
            case "ready":
                await self.update_readiness()

    async def update_score(self):

        # TODO: Update scores on the database
        # FIX: the game state is now in redis hash; this part should be redone
        role = None
        game = json.loads(r.get(f"game_room_state:{self.game_uuid}"))
        for player in game["players_details"]:
            if str(player["user"]["id"]) == str(self.user_id):
                player["score"] += 1
                role = player["role"]
                break
        scores = {
            player["role"]: str(player["score"]) for player in game["players_details"]
        }

        r.set(f"game_room_state:{self.game_uuid}", json.dumps(game))
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "broadcast",
                "info": "score",
                "message": {
                    "role": role,
                    "scores": json.dumps(scores),
                },
            },
        )

    async def update_readiness(self):
        self.players = json.loads(r.hget(f"game_room_state:{self.game_uuid}", "players_details"))
        for player in self.players:
            if player["user"]["id"] == self.user_id and not player["ready"]:
                player["ready"] = True
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "broadcast",
                        "info": "player_ready",
                        "message": {
                            "players_details": self.players,
                        }
                    },
                )
                break
        print(self.players, flush=True)
        r.hset(f"game_room_state:{self.game_uuid}", "players_details", json.dumps(self.players))
        all_ready = all(player.get("ready", False) for player in self.players)
        print("--------> ready ", all_ready, flush=True)
        if all_ready:
            r.hset(f"game_room_state:{self.game_uuid}", "status", "ongoing")
            game_state = r.hgetall(f"game_room_state:{self.game_uuid}")
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "broadcast",
                    "info": "start",
                    "message": game_state
                },
            )

    async def whisper(self, event):
        if event["sender"] != self.channel_name:
            await self.send(
                text_data=json.dumps(
                    {"type": event["info"], "message": event["message"]}
                )
            )

    async def broadcast(self, event):
        await self.send(
            text_data=json.dumps({"type": event["info"], "message": event["message"]})
        )
