import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from .models import Room, Message
from Auth.models import Users
from django.utils import timezone

class Chat(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()  #

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        
        
        target_user = await self.get_user(self.room_name)

        if target_user:
            users = [target_user, self.scope["user"]]
            room_qs = await self.get_room(target_user)

            if not room_qs:
                self.room = await self.create_room(users)
            else:
                self.room = room_qs

            self.room_group_name = self.room.token

         
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

       
        msg = await self.create_message(message)

        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": msg.message,
                "sender": msg.sender.username,
                "timestamp": msg.timestamp.isoformat()
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event['message'],
            "sender": event["sender"],
            "timestamp": event["timestamp"]
        }))

    @database_sync_to_async
    def get_user(self, username):
        return get_object_or_404(Users, username=username)

    @database_sync_to_async
    def get_room(self, target_user):
        user = self.scope['user']
        return Room.objects.filter(users=target_user).first()

    @database_sync_to_async
    def create_room(self, users):
        room = Room.objects.create()
        room.users.set(users)
        return room

    @database_sync_to_async
    def create_message(self, message):
        return Message.objects.create(
            roomName=self.room,
            sender=self.scope["user"],
            message=message,
            timestamp=timezone.now()
        )
