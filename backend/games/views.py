from rest_framework.decorators import APIView
from rest_framework.response import Response
from authentication.models import User
from rest_framework import status
from rest_framework.decorators import api_view
from authentication.serializers import UserFriendSerializer
from chat.views import Conversation
from asgiref.sync import async_to_sync
from notification.models import Notifications
from .models import Game, Player, GameRoom, PlayerRating
from .serializers import GameRoomSerializer
from .tasks import mark_game_room_as_expired
from matchmaking.matchmaker import GAME_EXPIRATION
from chat.models import Conversation, Message
from channels.layers import get_channel_layer
from authentication.serializers import UserSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.db.models import Q
from .models import GameRoom, Game
from .serializers import GameRoomSerializer
import json
from django.core.exceptions import ObjectDoesNotExist

@api_view(["POST"])
def inviteFriend(request, game_name=None):

    if not game_name:
        return Response(
            {"error": "not game name provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    friend_id = request.data.get("friend_id")
    if not friend_id:
        return Response(
            {"error": "no friend id provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    conversation_id = request.data.get("conversation_id")
    if not conversation_id:
        return Response(
            {"error": "no conversatoin id provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        game = Game.objects.get(name=game_name)
        conversation = Conversation.objects.get(ConversationId=conversation_id)
        if conversation.isBlocked:
            return Response(
                {"error": "this conversation is blocked you cannot invite this user"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        player = Player.objects.filter(
            user=request._user,
            game_room__status__in=[
                GameRoom.Status.WAITING,
                GameRoom.Status.ONGOING,
                GameRoom.Status.PAUSED,
            ],
        )

        if player:
            return Response(
                {
                    "error": "you are already associated with another game you cannot send the invite"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        players_data = [
            {"user": request._user.id, "role": 1},
            {"user": friend_id, "role": 2},
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
                "gameRoomId": str(game_room.id),
            },
        )

        user = User.objects.get(id=friend_id)
        notification = Notifications.objects.create(
            notifType="IG",
            userId=user,
            senderId=request._user,
            senderUsername=request._user.username,
            targetId=conversation_id,
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
                "timestamp": str(message.timestamp.strftime("%b %d, %H:%M")),
            },
        )

        group_name = f"notifications_{friend_id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_invite_to_notification",
                "sender_username": request._user.username,
                "game": game_name,
            },
        )

        return Response(
            {"message": "invite sent successfully"}, status=status.HTTP_200_OK
        )

    except Exception as e:
        print(e, flush=True)
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def getOnlineMatches(request):
    games = GameRoom.objects.exclude(
        Q(status=GameRoom.Status.COMPLETED)
        | Q(status=GameRoom.Status.EXPIRED)
        | Q(status=GameRoom.Status.WAITING)
    )
    serializers = GameRoomSerializer(games, many=True)
    gamestowatch = []
    for serialized in serializers.data:
        game = Game.objects.get(pk=serialized["game"])
        serialized["game"] = game.name
        serialized["players"] = json.loads(serialized["players"])
        players = serialized["players"]
        game_data = {
            "game": serialized["game"],
            "id": serialized["id"],
            "started_at": serialized["started_at"],
            "players": [],
        }
        for player_data in players:
            player = player_data["user"]
            game_data["players"].append(
                {
                    "username": player["username"],
                    "profile_image": player["profile_image"],
                    "score": player_data["score"],
                }
            )
        gamestowatch.append(game_data)

    return Response(gamestowatch, status=status.HTTP_200_OK)

#remove later {
import random
import string

def random_username(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))
#}

@api_view(["GET"])
def get_rankings(request, game_name=None):
    if not game_name:
        return Response(
            {"error": "No game name provided"}, status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        game = Game.objects.get(name=game_name)
        players = PlayerRating.objects.filter(game=game)\
            .select_related('user')\
            .order_by('-rating')
        
        rankings = []
        current_user_id = request.user.id

        for idx, player in enumerate(players, 1):
            user = player.user
            lower, upper, rank = player.get_rank(player.rating)
            
            rankings.append({
                "rank": idx,
                "user_id": str(user.id),
                "username": user.username[:10],
                "rating": player.rating,
                "exp": user.get_levels(),
                "profile_image": user.profile_image.url if user.profile_image else None,
                "ranked": rank,
                "demote": lower,
                "promote": upper,
                "is_self": user.id == current_user_id,
            })
        
        # Add fake players for testing ==============================================================================================================================
        fake_players = [
            {
                "rank": len(rankings) + idx + 1,
                "user_id": f"fake-{idx}",
                "username": random_username(),
                "rating": 400 - idx * 10,
                "exp": random.randint(0, 10),
                "profile_image": None,
                "ranked": "Bronze",
                "demote": 350,
                "promote": 651,
                "is_self": False,
            }
            for idx in range(40)  # Add n fake players
        ]
        rankings.extend(fake_players)
        #ended here ==================================================================================================================================================
        response_data = {
            "game": game_name,
            "total_players": len(rankings),
            "rankings": rankings,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    except ObjectDoesNotExist:
        return Response(
            {"error": f"Game '{game_name}' not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )