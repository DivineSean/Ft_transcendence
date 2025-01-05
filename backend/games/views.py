from rest_framework.decorators import APIView
from rest_framework.response import Response
from authentication.models import User
from rest_framework import status
from rest_framework.decorators import api_view
from authentication.serializers import UserFriendSerializer
from chat.views import Conversation
from asgiref.sync import async_to_sync
from notification.models import Notifications
from .models import Game, Player, GameRoom
from .serializers import GameRoomSerializer
from .tasks import mark_game_room_as_expired
from matchmaking.matchmaker import GAME_EXPIRATION
from chat.models import Conversation, Message
from channels.layers import get_channel_layer
from authentication.serializers import UserSerializer

@api_view(['POST'])
def inviteFriend(request, game_name=None):

	if not game_name:
		return Response(
			{"error": "not game name provided"},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	friend_id = request.data.get('friend_id')
	if not friend_id:
		return Response(
			{"error": "no friend id provided"},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	conversation_id = request.data.get('conversation_id')
	if not conversation_id:
		return Response(
			{"error": "no conversatoin id provided"},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	try:
		game = Game.objects.get(name=game_name)
		conversation = Conversation.objects.get(ConversationId=conversation_id)
		if conversation.isBlocked:
			return Response(
				{"error": "this conversation is blocked you cannot invite this user"},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		player = Player.objects.filter(
			user=request._user,
			game_room__status__in=[GameRoom.Status.WAITING, GameRoom.Status.ONGOING]
		)

		if player:
			return Response(
			{"error": "you are already associated with another game you cannot send the invite"},
			status=status.HTTP_400_BAD_REQUEST
		)

		players_data = [
			{
				"user": request._user.id,
				"role": 1
			},
			{
				"user": friend_id,
				"role": 2
			},
		]

		game_data = {"game": game.id, "players": players_data}

		serializer = GameRoomSerializer(data=game_data)

		game_room = None
		if serializer.is_valid(raise_exception=True):
				game_room = serializer.create(serializer.validated_data)
				mark_game_room_as_expired.apply_async(
						args=[game_room.id], countdown=GAME_EXPIRATION
				)

		message = Message.objects.create(
			ConversationName=conversation,
			sender=request._user,
			message="game invite",
			metadata={
				"type": "invite", 
				"status": "waiting", 
				"game": game_name,
				"gameRoomId": str(game_room.id)
			}
		)
		
		user = User.objects.get(id=friend_id)
		notification = Notifications.objects.create(
				notifType="IG",
				userId=user,
				senderId=request._user,
				senderUsername=request._user.username,
				targetId=conversation_id
		)

		user_data = UserSerializer(request._user).data
		channel_layer = get_channel_layer()
		group_name = f"conv-{conversation_id}"
		async_to_sync(channel_layer.group_send)(
			group_name,
			{
				"type": "chat_message",
				"convId": conversation_id,
				"message": message.message,
				"metadata": message.metadata,
				"isRead": message.isRead,
				"isSent": True,
				"messageId": str(message.MessageId),
				"sender": user_data,
				"timestamp": str(
						message.timestamp.strftime("%b %d, %H:%M")
				),
			},
		)

		group_name = f"notifications_{friend_id}"
		async_to_sync(channel_layer.group_send)(
			group_name,
			{
				"type": "send_invite_to_notification",
				"sender_username": request._user.username,
				"game": game_name,
			}
		)

		return Response(
			{"message": "invite sent successfully"},
			status=status.HTTP_200_OK
		)
		
	except Exception as e:
		print(e, flush=True)
		return Response(
			{"error": str(e)},
			status=status.HTTP_400_BAD_REQUEST
		)



"""
def create_game(self, game_id, players):
		game_data = {"game": game_id, "players": players}
		serializer = GameRoomSerializer(data=game_data)
		if serializer.is_valid():
				game = serializer.create(serializer.validated_data)
				mark_game_room_as_expired.apply_async(
						args=[game.id], countdown=GAME_EXPIRATION
				)
		return game_room
"""