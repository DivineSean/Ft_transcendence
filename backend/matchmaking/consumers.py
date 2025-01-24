from channels.consumer import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from games.models import Game, GameRoom
from .matchmaker import Matchmaker
from .matchmaker import r
import json

matchmaker = Matchmaker()


class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

        self.player = str(self.scope["user"].id)
        self.game_name = self.scope["url_route"]["kwargs"]["game_name"]
        self.group_name = f"{self.game_name}_matchmaking_group"
        self.joined = False
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        try:
            self.game = await database_sync_to_async(Game.objects.filter)(
                name=self.game_name
            )
            active_room = await database_sync_to_async(
                GameRoom.objects.filter(
                    player__user=self.scope["user"],
                    status__in=[
                        GameRoom.Status.WAITING,
                        GameRoom.Status.ONGOING,
                        GameRoom.Status.PAUSED,
                    ],
                ).first
            )()
            if active_room is not None:
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "reconnect",
                            "message": {"room_id": str(active_room.id)},
                        }
                    )
                )
                raise Exception("You are already participating in an active game room.")
        except Game.DoesNotExist:
            self.close(code=4004, reason=f"Game {self.game_name} does not exist.")
            return
        except Exception as e:
            try:
                await self.close(reason=str(e))
            except:
                return

        try:
            searching = r.scard(f"{self.game_name}_players_in_queue")
            await self.send(
                text_data=json.dumps({"type": "update", "message": searching})
            )
        except:
            pass

    async def join_queue(self):
        try:
            await matchmaker.add_player(self.player, self.channel_name, self.game_name)
            r.sadd(f"{self.game_name}_players_in_queue", self.player)
            n = r.scard(f"{self.game_name}_players_in_queue")
            await self.channel_layer.group_send(
                self.group_name, {"type": "update", "message": n}
            )
            self.joined = True
        except Exception as e:
            await self.close(reason=str(e))
            return

    async def leave_queue(self):
        try:
            await matchmaker.remove_player(self.player, self.game_name)
            r.srem(f"{self.game_name}_players_in_queue", self.player)
            n = r.scard(f"{self.game_name}_players_in_queue")
            await self.channel_layer.group_send(
                self.group_name, {"type": "update", "message": n}
            )
            self.joined = False
        except:
            return

    async def disconnect(self, code):
        if self.joined:
            await self.leave_queue()
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            type = data["type"]
        except (json.JSONDecodeError, KeyError):
            return

        match type:
            case "join_queue":
                await self.join_queue()
            case "leave_queue":
                await self.leave_queue()

    async def update(self, event):
        await self.send(
            text_data=json.dumps({"type": "update", "message": event["message"]})
        )

    async def update_time(self, event):
        await self.send(
            text_data=json.dumps({"type": "update_time", "message": event["message"]})
        )

    async def match(self, event):
        await self.send(
            text_data=json.dumps({"type": "match_found", "message": event["message"]})
        )
        await self.close(code=4002)
