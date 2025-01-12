from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Tournament
from uuid import UUID
import math
from .tasks import manageTournament
from .serializers import TournamentSerializer
from games.models import Game


@api_view(["POST"])
def CreateTournament(request):
    maxPlayers = request.data.get("maxPlayers")
    if not maxPlayers or not str(maxPlayers).isdigit():
        return Response(
            {"error": "maxPlayers not specified or not a digit"}, status=400
        )
    
    maxPlayers = int(maxPlayers)
    if maxPlayers not in [4, 8, 16]:
        return Response({"error": "maxPlayers khas ykon 4, 8, wla 16"}, status=400)

    tournamentName = request.data.get("TournamentName")
    if not tournamentName:
        return Response({"error" : "Tournament Name not specified"}, status = 400)
    
    existingLobby = Tournament.objects.filter(
        creator=request._user, isCompleted=False
    ).first()

    if existingLobby:
        return Response(
            {
                "message": "User already has active tournament",
                "lobbyID": str(existingLobby.lobbyID),
            }
        )
    try:
        newLobby = Tournament.objects.create(
            creator=request._user,
            maxPlayers=maxPlayers,
            total_rounds=int(math.log2(maxPlayers)),
            game=Game.objects.get(name="pong"),
        )
    except:
        return Response({"message": "Probably pong game doesn't exists"}, status=400)
    newLobby.addPlayer(request._user)

    return Response(
        {
            "message": "Tournament created successfully",
            "lobbyID": str(newLobby.lobbyID),
        },
        status=201,
    )


@api_view(["POST"])
def addPlayerToLobby(request):

    lobbyID = request.data.get("lobbyID")
    if not lobbyID:
        return Response("lobbyID required", status=400)
    try:
        UUID(lobbyID)
    except ValueError:
        return Response("lobbyID not valid UUID", status=400)

    try:
        lobby = Tournament.objects.get(lobbyID=lobbyID)
    except:
        return Response("No Tournament with this lobbyID", status=400)

    playerObj = lobby.addPlayer(request.user)

    response = Response({"message": f"{playerObj[0]}"}, status=int(playerObj[1]))

    if lobby.currentPlayerCount == lobby.maxPlayers:

        if lobby.isStarted == True:
            return Response({"message": "here"})
        tournamentID = TournamentSerializer(lobby).data
        manageTournament.delay(tournamentID)
        lobby.isStarted = True
        lobby.save()

    return response


@api_view(["GET"])
def deleteTournament(request):
    try:
        lobby = Tournament.objects.get(creator=request._user)
    except:
        return Response("No Tournament created by this Uuser", status=400)
    lobby.delete()
    return Response({"Tournament Deleted"}, status=200)
