from django.shortcuts import render
from rest_framework.decorators import APIView

from rest_framework.response import Response
from rest_framework import status
from django.db.models import OuterRef, Subquery
from chat.models import Conversation
from Auth.models import Users
from chat.models import Message
from django.db import connection
from django.db.models import Prefetch, OuterRef, Subquery, F, Q
from django.db.models.functions import Coalesce
from rest_framework.pagination import PageNumberPagination ,BasePagination


class GetConversationRooms(APIView):

	def get(self, request):
		# scope["user"] =>HTTP
		response = Response(status=200)
	
		# Get latest messages in a single query
		latest_messages = Message.objects.filter(
			ConversationName=OuterRef('ConversationId')
		).order_by('-timestamp').values('message', 'timestamp')[:1]
		
		print(f'user.id {request._user.id}', flush=True)
		print(f'user {request._user}', flush=True)
		conversations = ( # get all conversations with user infos and the latest messages, using sigle query
			Conversation.objects.filter(
				Q(Sender=request._user.id) | Q(Receiver=request._user.id)
			)
			.select_related('Sender', 'Receiver')
			.annotate(
				latest_message = Subquery(latest_messages.values('message')),
				latest_message_timestamp = Subquery(latest_messages.values('timestamp')),
				is_read_message = Subquery(latest_messages.values('isRead')),
			)
			.values(
				'ConversationId',
				'Sender_id',
				'Receiver_id',
				'latest_message',
				'latest_message_timestamp',
				'is_read_message',
				sender_first_name=F('Sender__first_name'),
				receiver_first_name=F('Receiver__first_name'),

				sender_last_name=F('Sender__last_name'),
				receiver_last_name=F('Receiver__last_name'),

				sender_username=F('Sender__username'),
				receiver_username=F('Receiver__username'),


				sender_isonline=F('Sender__isOnline'),
				receiver_isonline=F('Receiver__isOnline'),

				sender_last_login=F('Sender__last_login'),
				receiver_last_login=F('Receiver__last_login'),

				sender_about=F('Sender__about'),
				receiver_about=F('Receiver__about'),
			).order_by('-latest_message_timestamp')
		)

		users_data = []
		for conv in conversations:
			is_receiver = conv['Receiver_id'] == request._user.id
			users_data.append({
				"conversationId": conv['ConversationId'],
				"firstName": conv['receiver_first_name'] if not is_receiver else conv['sender_first_name'],
				"lastName": conv['receiver_last_name'] if not is_receiver else conv['sender_last_name'],
				"username": conv['receiver_username'] if not is_receiver else conv['sender_username'],
				"isOnline": conv['receiver_isonline'] if not is_receiver else conv['sender_isonline'],
				"lastLogin": (
					conv['receiver_last_login'].strftime('%b %d, %Y at %H:%M') if conv['receiver_last_login'] and not is_receiver
					else conv['sender_last_login'].strftime('%b %d, %Y at %H:%M') if conv['sender_last_login'] else None
				),
				"about": conv['receiver_about'] if not is_receiver else conv['sender_about'],
				"messageDate": conv['latest_message_timestamp'].strftime('%b %d, %H:%M') if conv['latest_message_timestamp'] else None,
				"lastMessage": conv['latest_message'],
				"isRead": conv['is_read_message'],
				"sender": True if not is_receiver else False,
				"friendId" : conv['Sender_id'] if conv['Sender_id'] != request._user.id else conv['Receiver_id']
			})

		print(f'conversations ++++++++ {conversations}', flush=True)
		return Response({"users": users_data}, status=200)


class SendMessage(APIView):
		
	def post(self,request, *args, **kwargs):
		try:
			ReceiverData = Users.objects.get(id = request.data.get("receiverID"))
			if ReceiverData.email == request._user.email: 
				return Response("Same clients", status= status.HTTP_400_BAD_REQUEST)
		except:
			return Response("ID of receiver not valid", status=status.HTTP_400_BAD_REQUEST)
		newConversation,isNew = Conversation.objects.get_or_create(
			Sender = request._user,
			Receiver = ReceiverData 
		)   
		response = Response(status=status.HTTP_200_OK)

		if not isNew:
			resData = {"message": "Conversation already created",'ConversationID': str(newConversation.ConversationId), "sender" : str(user.email)}
			response.status_code = status.HTTP_400_BAD_REQUEST
		else:
			resData = {"message": "Conversation  created",'ConversationID': str(newConversation.ConversationId), "sender" : str(user.email)}
			response.status_code = status.HTTP_201_CREATED
		response.data = resData
		
		return response
	
class getMessages(APIView):
	# Expecting convID, limit = how much data you want (optional => default 2,)
	# offset(from where you want data to be fetched from (default = 0))
	def post(self,request, *args, **kwargs):
			
		try:
			convID = Conversation.objects.get(ConversationId= request.data.get("convID"))
		except:
			return Response("convID not valid", status=status.HTTP_400_BAD_REQUEST)
		
		response = Response(status=status.HTTP_200_OK)
				
		chatMessages= []
		messages = Message.objects.filter(
			ConversationName = convID
		).order_by('-timestamp')
		
		paginator = PageNumberPagination()
		try:
			offset = int(request.data.get("offset", 0))  
			paginator.page_size = int(request.data.get("limit", 20))  
		except ValueError:
			response.data = {"Error" : "Either Offeset or limit is not a Number"}
			response.status_code = 400
			return response
		
		paginated_messages = messages[offset:offset + paginator.page_size]

		for message in reversed(paginated_messages):
			if message.sender.email == request._user.email: 
				chatMessages.append({
					"convId"		: convID.ConversationId,
					"messageId"	: message.MessageId,
					"message"		: message.message,
					"isRead"		: message.isRead,
					"isSent"		: message.isSent,
					"timestamp"	: message.timestamp.strftime('%b %d, %H:%M'),
					"isSender"	: True
					})#maybe other fields, not sure
			else:
				receiverID = convID.Receiver.id
				chatMessages.append({
					"convId"			: convID.ConversationId,
					"messageId"		: message.MessageId,
					"message"			: message.message,
					"isRead"			: message.isRead,
					"isSent"			: message.isSent,
					"timestamp"		: message.timestamp.strftime('%b %d, %H:%M'),
					"isSender"		: False,
					"ReceiverID"	: receiverID
					})
		response.data = {
			"messages": chatMessages,
			"next_offset": offset + paginator.page_size if len(paginated_messages) == paginator.page_size else None
		}
	
		return response

class SendMessageToFriend(APIView):

	def post(self, request):

	
		try:
			Message.objects.create(
				ConversationName = Conversation.objects.get(ConversationId = request.data.get("convID")),
				sender = Users.objects.get(id = userId),
				message= request.data.get("message"),
			)
		except:
			return Response("error")
    
		return Response({"convId": request.data.get("convID"), "userID": userId, "message": request.data.get("message")}, status = status.HTTP_200_OK)

		