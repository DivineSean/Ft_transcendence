from channels.generic.websocket import WebsocketConsumer, async_to_sync
from games.serializers import GameRoomSerializer
from .tasks import sync_game_room_data, mark_game_abandoned
from celery.result import AsyncResult
from django.conf import settings
from .models import GameRoom
from datetime import datetime
import json
import redis
import time

r = redis.Redis(
    host=settings.REDIS_CONNECTION["host"],
    port=settings.REDIS_CONNECTION["port"],
    password=settings.REDIS_CONNECTION["password"],
    db=settings.REDIS_CONNECTION["db"],
    decode_responses=True,
)

MAX_ALLOWED_TIMEOUTS = 2
TIMEOUT_DURATION = 30


# TODO: update player rating when the game ends
# TODO: update user status to 'in-game' and revert back to 'online' when the game concludes
# TODO: achievements
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
        self.handle_timeout()

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
            case "result":
                self.update_result(message)

    def connect_player(self):
        # WARNING: still have to handle spectators (players not taking part of the game)
        try:
            game_data = r.hgetall(f"game_room_data:{self.game_uuid}")
            if not game_data:
                game = GameRoom.objects.get(pk=self.game_uuid)
                serializer = GameRoomSerializer(game)
                game_data = serializer.data
                r.hset(f"game_room_data:{self.game_uuid}", mapping=game_data)
            self.players = game_data["players"] = json.loads(game_data["players"])
            game_data["state"] = json.loads(game_data["state"])
        except Exception as e:
            self.close(code=1006, reason=e)
            return

        if game_data["status"] == "paused":
            self.handle_reconnect(game_data)

        self.send(text_data=json.dumps({"type": "game_manager", "message": game_data}))

    def update_result(self, message):
        # update the game status to 'completed'
        # update the result field on the player
        # notify players
        self.players = json.loads(r.hget(f"game_room_data:{self.game_uuid}", "players"))
        for player in self.players:
            if player["user"]["id"] == self.user_id:
                player["result"] = message
                break
        self.save_game_data(players=json.dumps(self.players), status="completed")
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "broadcast",
                "info": "game_manager",
                "message": {
                    "status": "completed",
                },
            },
        )

    def update_score(self):
        role = None
        self.players = json.loads(r.hget(f"game_room_data:{self.game_uuid}", "players"))
        for player in self.players:
            if str(player["user"]["id"]) == str(self.user_id):
                player["score"] += 1
                role = player["role"]
                break
        scores = {player["role"]: str(player["score"]) for player in self.players}

        self.save_game_data(turn=role, players=json.dumps(self.players))
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
        self.players = json.loads(r.hget(f"game_room_data:{self.game_uuid}", "players"))
        for player in self.players:
            if player["user"]["id"] == self.user_id and not player["ready"]:
                player["ready"] = True
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,
                    {
                        "type": "broadcast",
                        "info": "game_manager",
                        "message": {
                            "players": self.players,
                        },
                    },
                )
                break

        self.save_game_data(players=json.dumps(self.players))
        all_ready = all(player.get("ready", False) for player in self.players)
        if all_ready:
            start_time = int(time.time() * 1000)
            self.save_game_data(status="ongoing", started_at=start_time, countdown=0)
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {
                    "type": "broadcast",
                    "info": "game_manager",
                    "message": {
                        "status": "ongoing",
                        "players": self.players,
                    },
                },
            )
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {"type": "broadcast", "info": "time", "message": start_time},
            )

    def handle_reconnect(self, game_data):
        # remove the current player since they are reconnecting
        leaver = game_data["state"].pop(self.user_id, None)
        if leaver:
            task = AsyncResult(leaver["task_id"])
            task.revoke(terminate=True)

        # check if all players have reconnected, and resume the game
        if not game_data["state"]:
            game_data["status"] = "ongoing"
            start_time = int(game_data["started_at"])
            game_data["started_at"] = (
                int(time.time() * 1000) - int(game_data["paused_at"])
            ) + start_time
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {
                    "type": "whisper",
                    "info": "game_manager",
                    "sender": self.channel_name,
                    "message": game_data,
                },
            )
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {
                    "type": "broadcast",
                    "info": "time",
                    "message": game_data["started_at"],
                },
            )
            self.save_game_data(
                state=json.dumps(game_data["state"]),
                status="ongoing",
                started_at=game_data["started_at"],
                countdown=0,
            )
        else:
            self.save_game_data(state=json.dumps(game_data["state"]))

    def handle_timeout(self):
        game_data = r.hgetall(f"game_room_data:{self.game_uuid}")
        self.players = json.loads(game_data["players"])
        if game_data["status"] in ("ongoing", "paused"):
            leavers = json.loads(game_data["state"])
            for player in self.players:
                if player["user"]["id"] == self.user_id:
                    if player["timeouts"] > 0:
                        task = mark_game_abandoned.apply_async(
                            args=[self.game_uuid, self.user_id],
                            countdown=TIMEOUT_DURATION,
                        )
                        leavers[self.user_id] = {
                            "task_id": task.id,
                            "disconnect_at": datetime.now().isoformat(),
                        }
                        player["timeouts"] -= 1
                        paused_at = int(time.time() * 1000)
                        self.save_game_data(
                            status="paused",
                            paused_at=paused_at,
                            state=json.dumps(leavers),
                            players=json.dumps(self.players),
                            countdown=0,
                        )
                    else:
                        task = mark_game_abandoned.delay(self.game_uuid, self.user_id)
                    break
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {
                    "type": "broadcast",
                    "info": "game_manager",
                    "message": {
                        "status": "paused",
                        "players": self.players,
                    },
                },
            )

    def save_game_data(self, countdown=30, **kwargs):
        r.hset(f"game_room_data:{self.game_uuid}", mapping=kwargs)
        if countdown == 0:
            sync_game_room_data.delay(self.game_uuid)
        else:
            sync_game_room_data.apply_async(args=[self.game_uuid], countdown=countdown)

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
