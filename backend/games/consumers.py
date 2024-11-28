from channels.generic.websocket import WebsocketConsumer
from rest_framework.serializers import ValidationError
from games.serializers import GameRoomSerializer
from matchmaking.matchmaker import r
from asgiref.sync import async_to_sync
from django.core.cache import cache
from django.db import models
from .models import GameRoom
import json

class   GameConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.game_uuid = self.scope['url_route']['kwargs']['room_uuid']
        self.user_id = self.scope['user'].id

        try:
            game = GameRoom.objects.get(pk=self.game_uuid)
            serializer = GameRoomSerializer(game)
            serialized_game = serializer.data
            r.set(f"{self.game_uuid}:game_room_state", json.dumps(serialized_game))
        except Exception as e:
            self.close(code=1006, reason=e)
            return

        print(f"-------> {self.game_uuid}", flush=True)
        async_to_sync(self.channel_layer.group_add)(
            self.game_uuid,
            self.channel_name
        )

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.game_uuid,
            self.channel_name
        )

    def receive(self, text_data):
        # ignore messages coming from users not part of the game
        # isPlayer = any(player["user"]["id"] == self.user_id for player in self.game["players_details"])
        # if not isPlayer:
        #   return

        try:
            data = json.loads(text_data)
            type = data['type']
            message = data['message']
        except (json.JSONDecodeError, KeyError):
            print("------------------> nn hh", flush=True)
            return

        match type:
            case 'score':
                self.update_score()
            case 'update':
                async_to_sync(self.channel_layer.group_send)(
                    self.game_uuid,
                    {
                        'type': 'whisper',
                        'info': 'update',
                        'sender': self.channel_name,
                        'message': message,
                    }
                )
            case 'ready':
                self.update_readiness()

    def update_score(self):

        # TODO: Update scores on the database
        role = None
        game = json.loads(r.get(f"{self.game_uuid}:game_room_state"))
        for player in game['players_details']:
            if str(player['user']['id']) == str(self.user_id):
                player['score'] += 1
                role = player['role']
                break
        scores = { player['role'] : str(player['score']) for player in game['players_details'] }

        r.set(f"{self.game_uuid}:game_room_state", json.dumps(game))
        async_to_sync(self.channel_layer.group_send)(
            self.game_uuid,
            {
                'type': 'broadcast',
                'info': 'score',
                'message': {
                    'role': role,
                    'scores': json.dumps(scores),
                },
            }
        )

    def update_readiness(self):
        players_ready = cache.get(self.game_uuid, {})
        players_ready[self.user_id] = True
        if len(players_ready) == 2:
            async_to_sync(self.channel_layer.group_send)(
                self.game_uuid,
                {
                    'type': 'broadcast',
                    'info': 'play',
                    'message': {},
                }
            )
        cache.set(self.game_uuid, players_ready)

    def whisper(self, event):
        if (event['sender'] != self.channel_name):
            self.send(text_data=json.dumps({"type": event['info'], "message": event['message']}))

    def broadcast(self, event):
        self.send(text_data=json.dumps({
            'type': event['info'],
            'message': event['message']
        }))
