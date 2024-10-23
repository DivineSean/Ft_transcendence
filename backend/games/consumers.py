import json
from channels.generic.websocket import WebsocketConsumer
# from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class   Test(WebsocketConsumer):
    def connect(self):
        self.accept()

        async_to_sync(self.channel_layer.group_add)(
            "test_group",
            self.channel_name
        )
        # self.send(
        #     text_data=json.dumps({"type": "test", "message": "hello world"})
        # )

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            "test_group",
            self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        async_to_sync(self.channel_layer.group_send)(
            'test_group',
            {
                'type': 'Broadcast',
                'message': message,
            }
        )

    def Broadcast(self, event):
        message = event['message']
        self.send(
            text_data=json.dumps({"message": message})
        )

