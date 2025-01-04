from rest_framework.decorators import APIView
from rest_framework.response import Response
from authentication.models import User
from rest_framework import status
from rest_framework.decorators import api_view
from authentication.serializers import UserFriendSerializer
from chat.views import Conversation
from asgiref.sync import async_to_sync
from notification.models import Notifications
from .models import Game
from .serializers import GameRoomSerializer
from .tasks import mark_game_room_as_expired
from matchmaking.matchmaker import GAME_EXPIRATION
from chat.models import Conversation, Message

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
		
		Message.objects.create(
			ConversationName=conversation,
			sender=request._user,
			message="invite",
			metadata={"type": "invite", "status": "pending"}
		)

		print('game', game, conversation, flush=True)

		players_data = [
			{
				"user": request._user.id,
				"role": 1
			},
			{
				"user": friend_id,
				"role": 1
			},
		]

		game_data = {"game": game.id, "players": players_data}

		serializer = GameRoomSerializer(data=game_data)

		# need to check if the player is already in game to don't allow him to invite the other players
		# if serializer.is_valid(raise_exception=True):
		# 		game = serializer.create(serializer.validated_data)
		# 		mark_game_room_as_expired.apply_async(
		# 				args=[game.id], countdown=GAME_EXPIRATION
		# 		)
		
		# user = User.objects.get(id=friend_id)
		# notification, isNew = Notifications.objects.get_or_create(
		# 		notifType="FR",
		# 		userId=user,
		# 		senderId=request._user,
		# 		senderUsername=request._user.username,
		# 		targetId=str(request._user.id),
		# )

		# check if the notif is not created before or already read
		# if not isNew or notification.isRead:
		# 		notification.updateRead()
		# 		channel_layer = get_channel_layer()
		# 		group_name = f"notifications_{userId}"
		# 		async_to_sync(channel_layer.group_send)(
		# 				group_name,
		# 				{
		# 						"type": "send_invite_to_friend",
		# 						"sender": str(request._user.id),
		# 				},
		# 		)

		return Response(
			{"message": "invite d left"},
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