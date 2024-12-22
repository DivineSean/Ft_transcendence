from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Lobby, Player
from uuid import UUID



@api_view(["POST"])
def CreateTournament(request):
    maxPlayers = request.data.get("maxPlayers")
    if not maxPlayers or not maxPlayers.isdigit():
        return Response("Either maxPlayers not specified or notdigit", status = 400)
    if int(maxPlayers) != 4 and int(maxPlayers) != 8 and int(maxPlayers) != 16:
        return Response("maxPlayers should be 4/8/16", status = 400)
    existingLobby = Lobby.objects.filter(creator = request._user) 
    if existingLobby:
        return Response({"message":"User Already have active tournament", "roomID" : existingLobby.values('roomID').first()['roomID']})
    newLobby = Lobby.objects.create( 
        creator = request._user,
        maxPlayers = int(maxPlayers)
    )
    newLobby.addPlayer(request._user)
    return Response({"message" : "Lobby Created Successfully","roomID" : str(newLobby.roomID)}, status= 201)

@api_view(["POST"])
def addPlayerToLobby(request):
    lobbyID = request.data.get("lobbyID")
    if not lobbyID:
        return Response("lobbyID requiered", status = 400)
    try:
        UUID(lobbyID)
    except:
        return Response("lobbyID not valid uuid", status = 400)
    try:
        lobby = Lobby.objects.get(roomID = lobbyID)
    except:
        return Response("No Lobby with this lobbyID", status = 400)
         
    playerObj = lobby.addPlayer(request._user)

    if lobby.currentPlayerCount == lobby.maxPlayers:
        # khsni n9ad brackets system
        pass
    return Response({"message" : f'{playerObj[0]}'}, status = int(playerObj[1]))

@api_view(["GET"])
def deleteTournament(request):
    try:
        lobby = Lobby.objects.get(creator = request._user)
    except:
        return Response("No Lobby created by this Uuser", status = 400)
    lobby.delete()
    return Response({"Lobby Deleted"}, status = 200) 
    