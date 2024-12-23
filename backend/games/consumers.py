from channels.generic.websocket import WebsocketConsumer, async_to_sync
from games.serializers import GameRoomSerializer
from .tasks import sync_game_room_data
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


class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.user_id = str(self.scope["user"].id)
        self.game_uuid = self.scope["url_route"]["kwargs"]["room_uuid"]
        self.group_name = f"game_room_{self.game_uuid}"

        async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        self.connect_player()

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )

    def receive(self, text_data):
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
                self.update_score()
            case "update":
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,
                    {
                        "type": "whisper",
                        "info": "update",
                        "sender": self.channel_name,
                        "message": message,
                    },
                )
            case "ready":
                self.update_readiness()

    def connect_player(self):
        # WARNING: still have to handle spectators (players not taking part of the game)
        try:
            game_data = r.hgetall(f"game_room_data:{self.game_uuid}")
            if not game_data:
                game = GameRoom.objects.get(pk=self.game_uuid)
                serializer = GameRoomSerializer(game)
                game_data = serializer.data
                r.hset(f"game_room_data:{self.game_uuid}", mapping=game_data)
            print("---------------> ", game_data, flush=True)
            self.players = game_data["players_details"] = json.loads(
                game_data["players_details"]
            )
            game_data["state"] = json.loads(game_data["state"])
        except Exception as e:
            self.close(code=1006, reason=e)
            return

        print(" game_data ---------------> ", game_data, self.players, flush=True)
        self.send(text_data=json.dumps({"type": "game_manager", "message": game_data}))

    def update_score(self):

        # TODO: Update scores on the database
        # FIX: the game state is now in redis hash; this part should be redone
        role = None
        self.players = json.loads(
            r.hget(f"game_room_data:{self.game_uuid}", "players_details")
        )
        for player in self.players:
            if str(player["user"]["id"]) == str(self.user_id):
                player["score"] += 1
                role = player["role"]
                break
        scores = {player["role"]: str(player["score"]) for player in self.players}

        # r.set(f"game_room_data:{self.game_uuid}", json.dumps(game))
        self.save_game_data("players_details", json.dumps(self.players))
        async_to_sync(self.channel_layer.group_send)(
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

    def update_readiness(self):
        self.players = json.loads(
            r.hget(f"game_room_data:{self.game_uuid}", "players_details")
        )
        for player in self.players:
            if player["user"]["id"] == self.user_id and not player["ready"]:
                player["ready"] = True
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,
                    {
                        "type": "broadcast",
                        "info": "game_manager",
                        "message": {
                            "players_details": self.players,
                        },
                    },
                )
                break

        self.save_game_data("players_details", json.dumps(self.players))
        all_ready = all(player.get("ready", False) for player in self.players)
        if all_ready:
            self.save_game_data("status", "ongoing", 0)
            game_data = r.hgetall(f"game_room_data:{self.game_uuid}")
            game_data["players_details"] = json.loads(game_data["players_details"])
            game_data["state"] = json.loads(game_data["state"])
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {"type": "broadcast", "info": "game_manager", "message": game_data},
            )
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {"type": "broadcast", "info": "play", "message": {}},
            )

    def save_game_data(self, field, new_value, countdown=30):
        r.hset(f"game_room_data:{self.game_uuid}", field, new_value)
        if countdown == 0:
            sync_game_room_data.delay(self.game_uuid)
        else:
            sync_game_room_data.apply_async(args=[self.game_uuid], countdown=countdown)

        pass

    def whisper(self, event):
        if event["sender"] != self.channel_name:
            self.send(
                text_data=json.dumps(
                    {"type": event["info"], "message": event["message"]}
                )
            )

    def broadcast(self, event):
        self.send(
            text_data=json.dumps({"type": event["info"], "message": event["message"]})
        )
