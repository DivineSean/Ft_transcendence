from channels.consumer import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from games.models import Game
from .matchmaker import Matchmaker
from .matchmaker import r
import json

matchmaker = Matchmaker()


class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

        self.player = str(self.scope["user"].id)
        self.game_name = self.scope["url_route"]["kwargs"]["game_name"]
        print(f"--- game --> {self.game_name} ---", flush=True)
        self.group_name = f"{self.game_name}_matchmaking_group"
        await self.channel_layer.group_add(self.group_name, self.channel_name)

    async def join_queue(self):
        try:
            await matchmaker.add_player(self.player, self.channel_name, self.game_name)
            n = r.incr(f"{self.game_name}_players_in_queue")
            await self.channel_layer.group_send(self.group_name, {
                "type": "update",
                "message": n
            })
        except Exception as e:
            await self.close(reason=str(e))
            return

    async def leave_queue(self):
        try:
            await matchmaker.remove_player(self.player, self.channel_name)
            n = r.decr(f"{self.game_name}_players_in_queue")
            await self.channel_layer.group_send(self.group_name, {
                "type": "update",
                "message": n
            })
        except:
            return
    
    async def disconnect(self, code):
        await matchmaker.remove_player(self.player, self.game_name)
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

    async def match(self, event):
        await self.send(
            text_data=json.dumps({"type": "match_found", "message": event["message"]})
        )
        await self.close()
