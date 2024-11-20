import json
from channels.generic.websocket import WebsocketConsumer
from django.shortcuts import get_object_or_404
from .models import Conversation, Message
from Auth.models import Users
from django.utils import timezone
from asgiref.sync import async_to_sync


#Chat room name 
class Chat(WebsocketConsumer):
		def connect(self):
				#isRead = True
				#CHeck if user in the conversation 
				self.room_name = self.scope['url_route']['kwargs']['room_name']
				
				

				
				self.room_name = self.get_room() #expects UID 
				print(self.room_name, flush=True)
				if self.room_name == None:
						self.close()
						return
				
				self.room_group_name =f'Conversation_' + str(self.room_name.ConversationId)
				
				async_to_sync(self.channel_layer.group_add)(
						self.room_group_name,   
						self.channel_name
				)
				self.accept()
			

		def disconnect(self, code):
			
				async_to_sync(self.channel_layer.group_discard)(
						self.room_group_name,
						self.channel_name
				)

		def receive(self, text_data):

				# once i get the message
				# Store it in the Message Model
				try:
						text_data_json = json.loads(text_data)
						message = text_data_json["message"] 
				except Exception as e:
						print(e, flush=True)
						self.close()
						return
			
				msg = self.create_message(message)

				
				async_to_sync(self.channel_layer.group_send)(
						self.room_group_name,
						{
								"type": "chat_message",    
								"message": msg.message,
								"messageId": str(msg.MessageId),
								"sender": self.scope['user'].id, 
								"timestamp": str(msg.timestamp.strftime('%b %d, %Y at %H:%M'))
								# "timestamp": str(msg.timestamp.strftime('%H:%M'))
						}
				)

		def chat_message(self, event):
				
				self.send(text_data=json.dumps({
						"type": "message",
						"message": event['message'],
						"messageId": event['messageId'],
						"isSender": event["sender"] == self.scope['user'].id,
						"timestamp": event["timestamp"]
				}))

		def get_user(self):
				return  Users.objects.get()  #should be modifed

		def get_room(self):
				return Conversation.objects.get(ConversationId = self.room_name)#Get object or 404


		def create_message(self, message):
				#Database 
				return Message.objects.create(
						ConversationName=self.room_name,
						sender=Users.objects.get(email = self.scope["user"].email),
						message=message,
				)
		

#TO DO => restrictions in jwt (password)