from channels.generic.websocket import AsyncWebsocketConsumer
from .matchmaker import Matchmaker
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

        try:
            await matchmaker.add_player(self.player, self.channel_name, self.game_name)
        except Exception as e:
            await self.close(reason=str(e))
            return

    async def disconnect(self, code):
        await matchmaker.remove_player(self.player, self.game_name)
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def update(self, event):
        await self.send(
            text_data=json.dumps({"type": "update", "message": event["message"]})
        )

    async def match(self, event):
        await self.send(
            text_data=json.dumps({"type": "match_found", "message": event["message"]})
        )
        await self.close()
