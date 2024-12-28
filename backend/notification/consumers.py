from channels.generic.websocket import WebsocketConsumer
from .models import Notifications
from authentication.models import User
import json
from chat.models import Conversation, Message
from asgiref.sync import async_to_sync
from django.db.models import Q


class ChatAndNotificationConsumer(WebsocketConsumer):
    def connect(self):
        self.user = User.objects.get(id=self.scope["user"].id)

        # Set up chat rooms
        self.chat_rooms = []
        conversations = Conversation.objects.filter(
            Q(Sender=self.user.id) | Q(Receiver=self.user.id)
        )
        for conv in conversations:
            room_name = f"conv-{conv.ConversationId}"
            self.chat_rooms.append(room_name)
            async_to_sync(self.channel_layer.group_add)(room_name, self.channel_name)

        # Set up notification room
        self.notif_room = f"notifications_{self.user.id}"
        async_to_sync(self.channel_layer.group_add)(self.notif_room, self.channel_name)

        self.accept()
        self.send_unread_notifications()

    def disconnect(self, code):
        # Leave all chat rooms
        for room in self.chat_rooms:
            async_to_sync(self.channel_layer.group_discard)(room, self.channel_name)

        # Leave notification room
        async_to_sync(self.channel_layer.group_discard)(
            self.notif_room, self.channel_name
        )

    def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type")

            if message_type == "notification":
                self.handle_notification(data)
            elif message_type in [
                "message",
                "read",
                "typing",
                "stopTyping",
            ]:  # hado li kaynin for now ?
                self.handle_chat(data)
            else:
                self.close()

        except Exception as e:
            print(f"Error: {str(e)}", flush=True)
            self.close()

    def handle_chat(self, data):
        message = data.get("message")
        conv_id = f"conv-{data['convId']}"

        if conv_id not in self.chat_rooms:
            return

        if data["type"] == "message":
            msg = self.create_message(message, data["convId"])

            print("jdhjfhjhdjfhdf ", msg, flush=True)

            async_to_sync(self.channel_layer.group_send)(
                conv_id,
                {
                    "type": "chat_message",
                    "convId": data["convId"],
                    "message": msg.message,
                    "isRead": msg.isRead,
                    "isSent": True,
                    "messageId": str(msg.MessageId),
                    "sender": self.user,
                    "timestamp": str(msg.timestamp.strftime("%b %d, %H:%M")),
                },
            )
        elif data["type"] == "read":
            async_to_sync(self.channel_layer.group_send)(
                conv_id,
                {
                    "type": "chat_read_message",
                    "sender": self.user,
                    "convId": data["convId"],
                },
            )
        elif data["type"] in ["typing", "stopTyping"]:
            async_to_sync(self.channel_layer.group_send)(
                conv_id,
                {
                    "type": f"chat_{data['type']}",
                    "sender": self.user,
                    "convId": data["convId"],
                },
            )

    def handle_notification(self, data):
        message = data.get("message", {})
        print(message, "ksdjsdjjksdjksdj", flush=True)
        notif = self.create_notification(message)

        async_to_sync(self.channel_layer.group_send)(
            f"notifications_{notif.userId.id}",  # ma3rftch wach hadchi li khas
            {
                "type": "send_notification",
                "message": notif.notifMessage,
                "sender": self.user.id,
                "receiver": notif.userId.id,
                "notifType": notif.notifType,
                "timestamp": str(notif.timestamp.strftime("%b %d, %H:%M")),
            },
        )

    def send_unread_notifications(self):  # hadi ma3rftch wach ndirha gha REST API
        unread_notifs = Notifications.objects.filter(
            userId=self.user, isRead=False
        ).order_by("-timestamp")

        for notif in unread_notifs:
            self.send(
                text_data=json.dumps(
                    {
                        "type": "notif",
                        "message": notif.notifMessage,
                        "sender": None,
                        "receiver": self.user.id,
                        "notifType": notif.notifType,
                        "timestamp": notif.timestamp.strftime("%b %d, %H:%M"),
                    }
                )
            )

    # Chat helper methods
    def create_message(self, message, conv_id):
        return Message.objects.create(
            ConversationName=Conversation.objects.get(ConversationId=conv_id),
            sender=self.user,
            message=message,
        )

    def chat_message(self, event):
        self.send(
            text_data=json.dumps(
                {
                    "type": "message",
                    "message": event["message"],
                    "convId": event["convId"],
                    "isRead": event["isRead"],
                    "isSent": event["isSent"],
                    "messageId": event["messageId"],
                    "isSender": event["sender"]["id"] == self.user.id,
                    "firstName": (
                        self.user["first_name"]
                        if event["sender"]["id"] != self.user.id
                        else event["sender"]["first_name"]
                    ),
                    "lastName": (
                        self.user["last_name"]
                        if event["sender"]["id"] != self.user.id
                        else event["sender"]["last_name"]
                    ),
                    "timestamp": event["timestamp"],
                }
            )
        )

    def chat_read_message(self, event):
        if event["sender"]["id"] != self.user.id:
            Message.objects.filter(
                isRead=False, ConversationName=event["convId"], sender=self.user.id
            ).update(isRead=True)

            self.send(text_data=json.dumps({"type": "read", "convId": event["convId"]}))

    def chat_typing(self, event):
        if event["sender"]["id"] != self.user.id:
            self.send(
                text_data=json.dumps({"type": "typing", "convId": event["convId"]})
            )

    def chat_stop_typing(self, event):
        if event["sender"]["id"] != self.user.id:
            self.send(
                text_data=json.dumps({"type": "stopTyping", "convId": event["convId"]})
            )

    def create_notification(self, message):
        return Notifications.objects.create(
            userId=User.objects.get(id=message["userId"]),
            notifType=message["notifType"],
            notifMessage=message["notifMessage"],
        )

    def send_notification(self, event):
        self.send(
            text_data=json.dumps(
                {
                    "type": "notif",
                    "message": event["message"],
                    "sender": event["sender"],
                    "receiver": event["receiver"],
                    "notifType": event["notifType"],
                    "timestamp": event["timestamp"],
                }
            )
        )
