import json
from channels.generic.websocket import WebsocketConsumer
# from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache
from threading import Lock

role_lock = Lock()


class   Test(WebsocketConsumer):
    def connect(self):
        self.accept()

        with role_lock:
            self.assign_player_role()

        async_to_sync(self.channel_layer.group_add)(
            "test_group",
            self.channel_name
        )


    def disconnect(self, code):
        # Handle disconnections
        player1 = cache.get('player1')
        player2 = cache.get('player2')

        with role_lock:
            if player1 == self.channel_name:
                cache.delete('player1')
            elif player2 == self.channel_name:
                cache.delete('player2')

        async_to_sync(self.channel_layer.group_discard)(
            "test_group",
            self.channel_name
        )


    def assign_player_role(self):
        # Assign roles atomically within the lock
        player1 = cache.get('player1')
        player2 = cache.get('player2')

        if not player1:
            cache.set('player1', self.channel_name)
            self.send(json.dumps({'type': 'role', 'message': 'Player 1'}))
        elif not player2:
            cache.set('player2', self.channel_name)
            self.send(json.dumps({'type': 'role', 'message': 'Player 2'}))
        else:
            self.send(json.dumps({'type': 'info', 'message': 'Game is full, you are a spectator'}))

    def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        async_to_sync(self.channel_layer.group_send)(
            'test_group',
            {
                'type': 'update',
                'sender': self.channel_name,
                'message': message,
            }
        )

    def update(self, event):
        if (event['sender'] != self.channel_name):
            self.send(text_data=json.dumps({"type": "update", "message": event['message']}))
