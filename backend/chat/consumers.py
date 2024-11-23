import json
from channels.generic.websocket import WebsocketConsumer
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Conversation, Message
from Auth.models import Users
from django.utils import timezone
from asgiref.sync import async_to_sync


#Chat room name 
class Chat(WebsocketConsumer):
		def connect(self):
				self.room_name = self.scope['url_route']['kwargs']
				# self.scope["user"] = 
				# self.room_group_name =f'Conversation_' + str(self.room_name.ConversationId)
				conversations = Conversation.objects.filter(
					Q(Sender=self.scope["user"].id) | Q(Receiver=self.scope["user"].id))
				self.room_group_name = []
				for element in conversations:

					self.room_group_name.append(f"conv-{element.ConversationId}")
					print(f"connected convID: ====> {element.ConversationId}", flush=True)
					# print(f'connected to {self.room_group_name}', flush=True)
					async_to_sync(self.channel_layer.group_add)(
						f"conv-{element.ConversationId}",   
						self.channel_name
					)
				#GEt query of user either receiver, sender, 
				#loop on them => add new groups with name equals to "conv-{conversationId}"
				
				self.accept()
			

		def disconnect(self, code):
				for element in self.room_group_name:
					async_to_sync(self.channel_layer.group_discard)(
							element,
							self.channel_name
					)

		def receive(self, text_data):

				# once i get the message
				# Store it in the Message Model
				try:
					text_data_json = json.loads(text_data)
					message = text_data_json["message"] 
					self.convId = f"conv-{text_data_json['convId']}"
					self.convName = text_data_json['convId']
				except Exception as e:
						print("------>", e, flush=True)
						self.close()
						return
				
				for element in self.room_group_name:
					if element == self.convId:

						msg = self.create_message(message)
						user = { #should make a serializer
							'id': str(self.scope['user'].id),
							'first_name': self.scope['user'].first_name,
							'last_name': self.scope['user'].last_name,
							
						}
						print(f"receive userIDIDIDIDI: ====> {type(self.scope['user'])} ", flush=True)
						async_to_sync(self.channel_layer.group_send)(
								element,
								{
										"type": "chat_message", 
										"convId": str(self.convName),
										"message": msg.message,
										"messageId": str(msg.MessageId),
										"sender": user,
										"timestamp": str(msg.timestamp.strftime('%b %d, %H:%M'))
										# "timestamp": str(msg.timestamp.strftime('%H:%M'))
								}
						)
		#MAKE A SERIALZER ASAAAP ! SAAD
		def chat_message(self, event):
				
				self.send(text_data=json.dumps({
						"type"			: "message",
						"message"		: event['message'],
						"convId"		: event['convId'],
						"messageId"	: event['messageId'],
						"isSender"	: event['sender']["id"] == str(self.scope['user'].id),
						"firstName"	: self.scope['user'].first_name if event["sender"]["id"] != str(self.scope['user'].id) else event['sender']["first_name"],
						"lastName"	: self.scope['user'].last_name if event["sender"]["id"] != str(self.scope['user'].id) else event['sender']["last_name"],
						"timestamp"	: event['timestamp']
				}))

		def get_user(self):
				return  Users.objects.get()  #should be modifed

		def get_room(self, convID):
				return Conversation.objects.get(ConversationId = convID)#Get object or 404


		def create_message(self, message):
				#Database 
				return Message.objects.create(
						ConversationName = self.get_room(self.convName),
						sender=Users.objects.get(email = self.scope["user"].email),
						message=message,
				)
		

#TO DO => restrictions in jwt (password)