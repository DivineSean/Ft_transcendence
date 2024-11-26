from channels.generic.websocket import WebsocketConsumer
from rest_framework.serializers import ValidationError
from games.serializers import GameSerializer
from asgiref.sync import async_to_sync
from django.core.cache import cache
from django.db import models
from .models import Game
import json

class   GameConsumer(WebsocketConsumer):
    def connect(self):
        self.game_uuid = self.scope['url_route']['kwargs']['room_uuid']
        self.user_id = self.scope['user'].id

        try:
            game = Game.objects.get(pk=self.game_uuid)
            serializer = GameSerializer(game)
            self.game = serializer.data
        except (models.ObjectDoesNotExist, ValidationError):
            return

        self.accept()
        print(f"-------> {self.game_uuid}", flush=True)
        print(f"-------> {self.game}", flush=True)
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
        if self.user_id not in (self.game['player_one'], self.game['player_two']):
            return

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
        if self.user_id == self.game['player_one']:
            self.game['player_one_score'] += 1
        elif self.user_id == self.game['player_two']:
            self.game['player_two_score'] += 1

        async_to_sync(self.channel_layer.group_send)(
            self.game_uuid,
            {
                'type': 'broadcast',
                'info': 'score',
                'message': {
                    'player1': self.game['player_one_score'],
                    'player2': self.game['player_two_score'],
                }
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
