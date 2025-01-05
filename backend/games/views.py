from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.db.models import Q
from .models import GameRoom, Game
from .serializers import GameRoomSerializer
import json


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
