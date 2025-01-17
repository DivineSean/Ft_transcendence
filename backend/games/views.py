from rest_framework.decorators import APIView
from rest_framework.response import Response
from authentication.models import User
from rest_framework import status
from rest_framework.decorators import api_view
from authentication.serializers import UserFriendSerializer
from chat.views import Conversation
from asgiref.sync import async_to_sync
from notification.models import Notifications
from .models import Game, Player, GameRoom, PlayerRating, PlayerAchievement, Achievement
from .serializers import GameRoomSerializer, AchievementSerializer
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
import json
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.pagination import PageNumberPagination


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
        Q(status__in=[GameRoom.Status.COMPLETED, GameRoom.Status.EXPIRED, GameRoom.Status.WAITING])
    )
    serialized_games = GameRoomSerializer(games, many=True).data
    gamestowatch = {}
    gamestowatch["online"] = []
    gamestowatch["tournament"] = []
    
    
    for game_data in serialized_games:
        game = Game.objects.get(pk=game_data["game"])
        players = json.loads(game_data["players"])
        
        match_info = {
            "game": game.name,
            "id": game_data["id"],
            "started_at": game_data["started_at"],
            "players": [
                {
                    "username": player["user"]["username"],
                    "profile_image": player["user"]["profile_image"],
                    "score": player["score"],
                }
                for player in players
            ],
        }
        category = "tournament" if game_data["bracket"] != "null" else "online"
        if category == "tournament":
            gamestowatch["tournament"].append(match_info)
        else:
            gamestowatch["online"].append(match_info)
    return Response(gamestowatch, status=status.HTTP_200_OK)

@api_view(["GET"])
def get_rankings(request, game_name=None, offset=1):

    if not game_name:
        return Response(
            {"error": "No game name provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        game = Game.objects.get(name=game_name)
        players = (
            PlayerRating.objects.filter(game=game)
            .select_related("user")
            .order_by("-rating")
        )

        rankings = []
        current_user_id = request.user.id

        for idx, player in enumerate(players, 1):
            user = player.user
            lower, upper, rank = player.get_rank(player.rating)
            rankings.append(
                {
                    "rank": idx,
                    "user_id": str(user.id),
                    "username": user.username,
                    "rating": player.rating,
                    "exp": user.get_levels(),
                    "profile_image": (
                        user.profile_image.url if user.profile_image else None
                    ),
                    "ranked": rank,
                    "demote": lower,
                    "promote": upper,
                    "is_self": user.id == current_user_id,
                }
            )
        paginator = PageNumberPagination()
        try:
            paginator.page_size = int(request.data.get("limit", 30))
        except:
            return Response(
                {"Error": "Either Offeset or limit is not a Number"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        paginatedRankings = rankings[offset : offset + paginator.page_size]

        response_data = {
            "game": game_name,
            "rankings": paginatedRankings,
            "next_offset": (
                offset + paginator.page_size
                if len(paginatedRankings) == paginator.page_size
                else -1
            ),
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except ObjectDoesNotExist:
        return Response(
            {"error": f"Game '{game_name}' not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def getStats(request, game_name=None, username=None):
    if not game_name:
        return Response(
            {"error": "No game name provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user
    user_id = user.id if not username else None
    if username:
        try:
            user = User.objects.get(username=username)
            user_id = user.id
        except ObjectDoesNotExist:
            return Response(
                {"error": f"User '{username}' not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    try:
        game = Game.objects.get(name=game_name)
    except ObjectDoesNotExist:
        return Response(
            {"error": f"Game '{game_name}' not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        player = PlayerRating.objects.get(user=user_id, game=game)
    except ObjectDoesNotExist:
        return Response(
            {"error": f"Player with id '{user_id}' in game '{game_name}' not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    try:
        achie_vements = Achievement.objects.filter(game=game)
        player_achievements = PlayerAchievement.objects.filter(user=user, game=game)
        progress = {achievement.name: 0 for achievement in achie_vements}
        for player_achievement in player_achievements:
            for achievement in achie_vements:
                if player_achievement.achievement.name == achievement.name:
                    progress[achievement.name] += player_achievement.progress
    except ObjectDoesNotExist:
        return Response(
            {"error": f"Achievements in game '{game_name}' not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    total_games = player.wins + player.losses
    winrate = (player.wins / total_games) * 100 if total_games > 0 else 100
    demote, promote, elo = player.get_rank(player.rating)

    stats = {
        "total_games": total_games,
        "winrate": winrate,
        "recent_results": player.recent_results,
        "elo": elo,
        "mmr": player.rating,
        "promote": promote,
        "demote": demote,
        "rating_history": player.rating_history,
        "achievement_progress": progress,
    }

    return Response(
        {"game": game_name, "stats": stats},
        status=status.HTTP_200_OK,
    )
