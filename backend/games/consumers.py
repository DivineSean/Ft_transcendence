import json
from channels.generic.websocket import WebsocketConsumer
# from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache


class   Test(WebsocketConsumer):
    def connect(self):
        self.accept()

        # Initialize the key 'players' if it doesn't exist
        cache.add('players', 1)  # Add only if the key doesn't exist

        # get current count from the cache
        players = cache.get('players', 1)

        async_to_sync(self.channel_layer.group_add)(
            "test_group",
            self.channel_name
        )
        self.send(
            text_data=json.dumps({"type": "role", "message": players})
        )
        cache.incr('players', 1)

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            "test_group",
            self.channel_name
        )
        cache.decr('players', 1)

    def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        async_to_sync(self.channel_layer.group_send)(
            'test_group',
            {
                'type': 'update',
                'message': message,
            }
        )

    def update(self, event):
        message = event['message']
        self.send(
            text_data=json.dumps({"type": "update", "message": message})
        )

