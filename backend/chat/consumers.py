import json
from channels.generic.websocket import WebsocketConsumer
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Conversation, Message
from Auth.models import Users
from django.utils import timezone
from asgiref.sync import async_to_sync
from Auth.serializers import UserSerializer
from rest_framework.serializers import ValidationError
from notification.models import Notifications


class Chat(WebsocketConsumer):
	def connect(self):
		self.room_name = self.scope["url_route"]["kwargs"]

		try:
			serializer = UserSerializer(self.scope["user"])
			self.user = serializer.data

		except ValidationError:
			return

		conversations = Conversation.objects.filter(
			Q(Sender=self.user["id"]) | Q(Receiver=self.user["id"])
		)
		self.room_group_name = []
		for element in conversations:

			self.room_group_name.append(f"conv-{element.ConversationId}")
			async_to_sync(self.channel_layer.group_add)(
				f"conv-{element.ConversationId}", self.channel_name
			)
		self.notif_room_name = f"notifications_{self.user['id']}"
		async_to_sync(self.channel_layer.group_add)(
			self.notif_room_name, self.channel_name
		)
		self.accept()

	def disconnect(self, code):
		for element in self.room_group_name:
			async_to_sync(self.channel_layer.group_discard)(element, self.channel_name)

	def receive(self, text_data):

		# once i get the message
		# Store it in the Message Model

		try:
			text_data_json = json.loads(text_data)
			message = text_data_json["message"]
			self.convId = f"conv-{text_data_json['convId']}"
			self.convName = text_data_json["convId"]
		except Exception as e:
			self.close()
			return

		for element in self.room_group_name:
			if element == self.convId:

				# here for the sended messaged create a new message in db
				# with the content that we received from the sender
				if text_data_json["type"] == "message":

					msg = self.create_message(message)
					async_to_sync(self.channel_layer.group_send)(
						element,
						{
							"type": "chat_message",
							"convId": str(self.convName),
							"message": msg.message,
							"isRead": msg.isRead,
							"isSent": True,
							"messageId": str(msg.MessageId),
							"sender": self.user,
							"timestamp": str(msg.timestamp.strftime("%b %d, %H:%M")),
						},
					)
				# here for the readed message event get all unread messages
				# of the sender and make them as readed
				elif text_data_json["type"] == "read":
					async_to_sync(self.channel_layer.group_send)(
						element,
						{
							"type": "chat_read_message",
							"sender": self.user,
							"convId": str(self.convName),
						},
					)
				elif text_data_json["type"] == "typing":
					async_to_sync(self.channel_layer.group_send)(
						element,
						{
							"type": "chat_typing",
							"sender": self.user,
							"convId": str(self.convName),
						},
					)
				elif text_data_json["type"] == "stopTyping":
					async_to_sync(self.channel_layer.group_send)(
						element,
						{
							"type": "chat_stop_typing",
							"sender": self.user,
							"convId": str(self.convName),
						},
					)

	def chat_stop_typing(self, event):
		if event["sender"]["id"] != self.user["id"]:
			self.send(
				text_data=json.dumps(
					{
						"type": "stopTyping",
						"convId": event["convId"],
					}
				)
			)

	def chat_typing(self, event):
		if event["sender"]["id"] != self.user["id"]:
			self.send(
				text_data=json.dumps({"type": "typing", "convId": event["convId"]})
			)

	def chat_read_message(self, event):
		messages = (
			Message.objects.filter(isRead=False, ConversationName=event["convId"])
			.exclude(sender=self.user["id"])
			.update(isRead=True)
		)

		if event["sender"]["id"] != self.user["id"]:
			self.send(text_data=json.dumps({"type": "read", "convId": event["convId"]}))

	def chat_message(self, event):
		# print(event["isRead"], flush=True)
		self.send(
			text_data=json.dumps(
				{
					"type": "message",
					"message": event["message"],
					"convId": event["convId"],
					"isRead": event["isRead"],
					"isSent": event["isSent"],
					"messageId": event["messageId"],
					"isSender": event["sender"]["id"] == self.user["id"],
					"firstName": (
						self.user["first_name"]
						if event["sender"]["id"] != self.user["id"]
						else event["sender"]["first_name"]
					),
					"lastName": (
						self.user["last_name"]
						if event["sender"]["id"] != self.user["id"]
						else event["sender"]["last_name"]
					),
					"timestamp": event["timestamp"],
				}
			)
		)

	def send_friend_request(self, event):
		self.send(
			text_data=json.dumps(
				{
					"type": "friendRequest",
					"sender": event["sender"],
					"message": f"You Received a Friend Request from {self.user['username']}",
				}
			)
		)

	def get_user(self):
		return Users.objects.get()  # should be modifed

	def get_room(self, convID):
		return Conversation.objects.get(ConversationId=convID)  # Get object or 404

	def create_message(self, message):
		return Message.objects.create(
			ConversationName=self.get_room(self.convName),
			sender=Users.objects.get(email=self.user["email"]),
			message=message,
		)


# TO DO => restrictions in jwt (password)
