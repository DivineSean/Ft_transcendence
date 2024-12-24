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
from rest_framework.pagination import PageNumberPagination, BasePagination
from django.conf import settings
from .serializers import ConversationSerializer, UserSerializerOne

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from notification.models import Notifications


class ChatConversation(APIView):
	def get(self, request):
		user_id = request.user.id

		latest_messages = Message.objects.filter(
			ConversationName=OuterRef("pk")
		).order_by("-timestamp")

		conversations = (
			Conversation.objects.filter(Q(Sender_id=user_id) | Q(Receiver_id=user_id))
			.annotate(
				latest_message=Subquery(latest_messages.values("message")[:1]),
				latest_message_timestamp=Subquery(
					latest_messages.values("timestamp")[:1]
				),
				is_read_message=Subquery(latest_messages.values("isRead")[:1]),
				sender=Subquery(latest_messages.values("sender")[:1]),
			)
			.select_related("Sender", "Receiver")
			.order_by("-latest_message_timestamp")
		)

		serialized_data = {
			"users": [
				{
					"conversationId": conversation.ConversationId,
					"isBlocked": conversation.isBlocked,
					"lastMessage": conversation.latest_message,
					"messageDate": (
						conversation.latest_message_timestamp.strftime("%b %d, %H:%M")
						if conversation.latest_message_timestamp
						else None
					),
					"isRead": conversation.is_read_message,
					"sender": True if conversation.sender == user_id else False,
					**UserSerializerOne(
						conversation.Receiver
						if conversation.Sender.id == user_id
						else conversation.Sender
					).data,
				}
				for conversation in conversations
			]
		}

		return Response(serialized_data)

	def post(self, request, *args, **kwargs):

		try:
			userId = request.data.get("userId")
			userData = Users.objects.get(id=userId)
			if userData.email == request._user.email:
				return Response("Same clients", status=status.HTTP_400_BAD_REQUEST)
		except:
			return Response(
				"ID of receiver not valid", status=status.HTTP_400_BAD_REQUEST
			)

		conversation = Conversation.objects.filter(
			Q(Sender=request._user, Receiver=userData)
			| Q(Sender=userData, Receiver=request._user)
		).exists()

		response = Response(status=status.HTTP_200_OK)

		if not conversation:
			newConversation = Conversation.objects.create(
				Sender=request._user, Receiver=userData
			)
			resData = {
				"message": "Conversation  created",
				"conversationId": str(newConversation.ConversationId),
				"sender": str(request._user.email),
			}
			response.status_code = status.HTTP_201_CREATED

			notification, isNew = Notifications.objects.get_or_create(
				notifType="CC",
				userId=userData,
				senderId=request._user,
				senderUsername=request._user.username,
				targetId=str(newConversation.ConversationId)
			)

			if not isNew and notification.isRead:
				notification.updateRead()

			channel_layer = get_channel_layer()
			group_name = f"notifications_{userId}"
			async_to_sync(channel_layer.group_send)(
				group_name,
				{
					"type": "create_conversation_room",
					"convId": str(newConversation.ConversationId),
					"sender": str(request._user.id),
					"notifId": str(notification.notificationId),
					"targetId": str(newConversation.ConversationId)
				},
			)

			group_name = f"notifications_{str(request._user.id)}"
			async_to_sync(channel_layer.group_send)(
				group_name,
				{
					"type": "create_conversation_room",
					"convId": str(newConversation.ConversationId),
					"sender": str(request._user.id),
					"notifId": str(notification.notificationId),
					"targetId": str(newConversation.ConversationId)
				},
			)
		else:
			conv = Conversation.objects.get(
				Q(Sender=request._user, Receiver=userData)
				| Q(Sender=userData, Receiver=request._user)
			)
			resData = {
				"message": "Conversation already created",
				"conversationId": str(conv.ConversationId),
				"sender": str(request._user.email),
			}
			response.status_code = status.HTTP_200_OK

		response.data = resData

		return response


class getMessages(APIView):
	# Expecting convID, limit = how much data you want (optional => default 2,)
	# offset(from where you want data to be fetched from (default = 0))
	def post(self, request, *args, **kwargs):

		try:
			convID = Conversation.objects.get(ConversationId=request.data.get("convID"))
		except:
			return Response("convID not valid", status=status.HTTP_400_BAD_REQUEST)

		response = Response(status=status.HTTP_200_OK)

		chatMessages = []
		messages = Message.objects.filter(ConversationName=convID).order_by(
			"-timestamp"
		)

		paginator = PageNumberPagination()
		try:
			offset = int(request.data.get("offset", 0))
			paginator.page_size = int(request.data.get("limit", 20))
		except ValueError:
			response.data = {"Error": "Either Offeset or limit is not a Number"}
			response.status_code = 400
			return response

		paginated_messages = messages[offset : offset + paginator.page_size]

		for message in reversed(paginated_messages):
			if message.sender.email == request._user.email:
				chatMessages.append(
					{
						"convId": convID.ConversationId,
						"messageId": message.MessageId,
						"message": message.message,
						"isRead": message.isRead,
						"isSent": message.isSent,
						"timestamp": message.timestamp.strftime("%b %d, %H:%M"),
						"isSender": True,
					}
				)  # maybe other fields, not sure
			else:
				receiverID = convID.Receiver.id
				chatMessages.append(
					{
						"convId": convID.ConversationId,
						"messageId": message.MessageId,
						"message": message.message,
						"isRead": message.isRead,
						"isSent": message.isSent,
						"timestamp": message.timestamp.strftime("%b %d, %H:%M"),
						"isSender": False,
						"ReceiverID": receiverID,
					}
				)
		response.data = {
			"messages": chatMessages,
			"next_offset": (
				offset + paginator.page_size
				if len(paginated_messages) == paginator.page_size
				else None
			),
		}

		return response


class SendMessageToFriend(APIView):

	def post(self, request):

		try:
			Message.objects.create(
				ConversationName=Conversation.objects.get(
					ConversationId=request.data.get("convID")
				),
				sender=Users.objects.get(id=userId),
				message=request.data.get("message"),
			)
		except:
			return Response("error")

		return Response(
			{
				"convId": request.data.get("convID"),
				"userID": userId,
				"message": request.data.get("message"),
			},
			status=status.HTTP_200_OK,
		)
