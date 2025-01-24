from channels.generic.websocket import WebsocketConsumer, async_to_sync
from games.serializers import GameRoomSerializer
from .tasks import sync_game_room_data, mark_game_abandoned
from tournament.tasks import processGameResult
from celery.result import AsyncResult
from django.conf import settings
from authentication.models import User
from .models import Game, GameRoom, PlayerAchievement, PlayerRating
from datetime import datetime
import json
import redis
import time
import logging

logger = logging.getLogger("uvicorn.error")

r = redis.Redis(
    host=settings.REDIS_CONNECTION["host"],
    port=settings.REDIS_CONNECTION["port"],
    password=settings.REDIS_CONNECTION["password"],
    db=settings.REDIS_CONNECTION["db"],
    decode_responses=True,
)

TIMEOUT_DURATION = 30
XP_GAIN_TN = 280
XP_GAIN_NORMAL = 250


class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.error = False
        self.user = self.scope.get("user")
        self.user_id = str(self.scope["user"].id)
        self.game_name = self.scope["url_route"]["kwargs"]["game_name"]
        self.game_uuid = self.scope["url_route"]["kwargs"]["room_uuid"]
        self.group_name = f"game_room_{self.game_uuid}"

        async_to_sync(self.channel_layer.group_add)(
            self.group_name, self.channel_name)
        self.connect_player()

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )

        try:
            # Remove the player from the Redis list
            if self.error is False:
                r.lrem(f"game_room_data:{self.game_uuid}:players",
                       0,
                       self.user_id
                       )
        except Exception as e:
            logger.error(f"Error while disconnecting player: {str(e)}")

        self.handle_timeout()

    def receive(self, text_data):
        if self.me is None:
            return

        try:
            data = json.loads(text_data)
            type = data["type"]
            message = data["message"]
        except (json.JSONDecodeError, KeyError):
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
            case "notready":
                self.sending_decline()
            case "result":
                self.update_result(message)
            case "Achievements":
                self.update_achievements(message)

    def update_status(self, status):
        try:
            self.user.status = status
            self.user.save()
        except Exception as e:
            self.close(
                code=4006, reason=f"Unexpected error while saving user status: {str(e)}"
            )
            return

    def connect_player(self):
        try:
            existing_players = r.lrange(
                f"game_room_data:{self.game_uuid}:players", 0, -1
            )
            if str(self.user_id) in existing_players:
                self.error = True
                self.close(
                    code=4001, reason="Already connected from another client")
                return
            game_data = r.hgetall(f"game_room_data:{self.game_uuid}")
            if not game_data:
                game = GameRoom.objects.get(pk=self.game_uuid)
                serializer = GameRoomSerializer(game)
                game_data = serializer.data
                r.hset(f"game_room_data:{self.game_uuid}", mapping=game_data)
            self.players = game_data["players"] = json.loads(
                game_data["players"])
            self.me = next(
                (
                    index
                    for index, player in enumerate(self.players)
                    if player["user"]["id"] == self.user_id
                ),
                None,
            )
            game_data["state"] = json.loads(game_data["state"])
        except Exception as e:
            self.close(code=4004, reason=str(e))
            return

        # Add the player to the connected clients list
        r.rpush(f"game_room_data:{self.game_uuid}:players", self.user_id)

        if game_data["status"] == "paused" and self.me is not None:
            self.handle_reconnect(game_data)

        self.send(text_data=json.dumps(
            {"type": "game_manager", "message": game_data}))

    def update_result(self, message):
        self.players = json.loads(
            r.hget(f"game_room_data:{self.game_uuid}", "players"))

        player = self.players[self.me]
        player["result"] = message
        PlayerRating.handle_rating(
            self.user, Game.objects.get(name=self.game_name), player
        )
        is_tournament = json.loads(
            r.hget(f"game_room_data:{self.game_uuid}", "bracket")
        )
        if is_tournament:
            processGameResult.delay(self.game_uuid)
            self.user.increase_exp(XP_GAIN_TN)
        else:
            self.user.increase_exp(XP_GAIN_NORMAL)

        self.user.update_status(User.Status.ONLINE)
        self.save_game_data(
            players=json.dumps(self.players), status="completed", countdown=0
        )

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

    def update_achievements(self, message):
        # Handle Achievements
        try:
            PlayerAchievement.add_progress(
                user=self.user,
                game=Game.objects.get(name=self.game_name),
                achievement_name=message,
            )
        except Exception as e:
            logger.error(str(e))

    def update_score(self):
        self.players = json.loads(
            r.hget(f"game_room_data:{self.game_uuid}", "players"))
        player = self.players[self.me]
        player["score"] += 1
        scores = {player["role"]: str(player["score"])
                  for player in self.players}

        self.save_game_data(turn=player["role"],
                            players=json.dumps(self.players))
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "broadcast",
                "info": "score",
                        "message": {
                            "role": player["role"],
                            "scores": json.dumps(scores),
                        },
            },
        )

    def sending_decline(self):
        try:
            self.players = json.loads(
                r.hget(f"game_room_data:{self.game_uuid}", "players")
            )
            bracket = json.loads(
                r.hget(f"game_room_data:{self.game_uuid}", "bracket"))

            if bracket is not None or self.players[self.me]["ready"] is True:
                return

            GameRoom.objects.filter(pk=self.game_uuid).delete()
            r.delete(f"game_room_data:{self.game_uuid}")
            r.delete(f"game_room_data:{self.game_uuid}:players")

            for player in self.players:
                try:
                    user = User.objects.get(pk=player["user"]["id"])
                    user.update_status(User.Status.ONLINE)
                except Exception as e:
                    logger.error(str(e))

        except Exception as e:
            logger.error("Failed To Delete GameRoom", str(e))
            return

        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "broadcast",
                "info": "game_manager",
                        "message": {
                            "r": "no",
                        },
            },
        )

    def update_readiness(self):
        self.players = json.loads(
            r.hget(f"game_room_data:{self.game_uuid}", "players"))

        player = self.players[self.me]
        if not player["ready"]:
            player["ready"] = True
            self.user.update_status(User.Status.IN_GAME)
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {
                    "type": "broadcast",
                    "info": "game_manager",
                            "message": {
                                "players": self.players,
                                "r": "yes",
                            },
                },
            )

        self.save_game_data(players=json.dumps(self.players), countdown=0)
        all_ready = all(player.get("ready", False) for player in self.players)
        if all_ready:
            start_time = int(time.time() * 1000)
            self.save_game_data(
                status="ongoing", started_at=start_time, countdown=0)
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
        if not hasattr(self, "players") or not self.players or self.me is None:
            return

        game_data = r.hgetall(f"game_room_data:{self.game_uuid}")
        if not game_data:
            return
        self.players = json.loads(game_data["players"])
        player = self.players[self.me]
        if game_data["status"] in ("ongoing", "paused"):
            leavers = json.loads(game_data["state"])
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
            sync_game_room_data.apply_async(
                args=[self.game_uuid], countdown=countdown)

    def whisper(self, event):
        if event["sender"] != self.channel_name:
            self.send(
                text_data=json.dumps(
                    {"type": event["info"], "message": event["message"]}
                )
            )

    def broadcast(self, event):
        self.send(
            text_data=json.dumps(
                {"type": event["info"], "message": event["message"]})
        )
