from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Lobby, Player
from uuid import UUID
from .models import Match
import math


@api_view(["POST"])
def CreateTournament(request):
    maxPlayers = request.data.get("maxPlayers")
    if not maxPlayers or not maxPlayers.isdigit():
        return Response({"error": "maxPlayers not specified or not a digit"}, status=400)
    
    maxPlayers = int(maxPlayers)
    if maxPlayers not in [4, 8, 16]:
        return Response({"error": "maxPlayers khas ykon 4, 8, wla 16"}, status=400)
    
    existingLobby = Lobby.objects.filter(creator=request._user, is_completed=False).first()

    if existingLobby:
        return Response({"message": "User already has active tournament","lobbyID": str(existingLobby.lobbyID)})
    
    newLobby = Lobby.objects.create(
        creator=request._user,
        maxPlayers=maxPlayers
    )
    newLobby.addPlayer(request._user)
    
    return Response({"message": "Lobby created successfully","lobbyID": str(newLobby.lobbyID)}, status=201)


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
        createBracket(lobby)
        #send matches to markik

    return Response({"message" : f'{playerObj[0]}'}, status = int(playerObj[1]))

@api_view(["GET"])
def deleteTournament(request):
    try:
        lobby = Lobby.objects.get(creator = request._user)
    except:
        return Response("No Lobby created by this Uuser", status = 400)
    lobby.delete()
    return Response({"Lobby Deleted"}, status = 200) 

def createBracket(lobby):
    players = list(lobby.players.all()) #example la kano 4 players = [p1,p2,p3,p4]
    numRounds = int(math.log2(len(players))) #Reminder al kosala, logarithm howa l power d n , so ila user choosa tournament d 4 , then 2 rounds exists, 8 => 3 rounds exists, 16 => 4 rounds exists
    
    for num in range(numRounds): # numRounds = 2
        createMatches(lobby, players, num + 1) # in case numRounds = 2 donc num = 1 first round, num = 2 second round




def createMatches(lobby, players, roundNum):
    # matches = []
    for i in range(0, len(players), 2): # 2 b 2  (i = 0 then 2 in case len = 4)
        p1 = players[i] # 0 then  2 

        if i + 1 < len(players): # i = 1 then 3 
            p2 = players[i + 1] # 1 then 3
        else : 
            p2 = None

        #match = we dont need match for now
        Match.objects.create(
            lobby=lobby, # same lobby logic
            player1=p1, # 0, 2 (ids)
            player2=p2, # 1, 3 (kandwi 3la l ids)
            tnRound=roundNum # 1 the 2
        )
        
        # matches.append(match) # no need daba

@api_view(["POST"])
def MarkikDirChi9lwa(request):
    matchID = request.data.get("matchID")
    winnerID = request.data.get("winnerID")

    try:
        match = Match.objects.get(id=matchID)
        winner = Player.objects.get(id=winnerID)

        
        match.winner = winner
        match.save()

        
        if match.player1 != winner:
            loser = match.player1 
        else:  
            loser = match.player2
        
        # Player.objects.get(tounament = lobby, user != winner).delete() should fix this
        
        loser.delete() # deleti l 9lawi direct makayn la fix la walo , 3sbni
        
        if not Match.objects.filter(lobby=match.lobby, winner=None).exists():
            winners = Player.objects.filter(tournament=match.lobby).exclude(matches__winner=None)
            if len(winners) % 2 == 0:  # Ensure even number of winners for next round
                createMatches(match.lobby, winners, match.tnRound + 1)

        return Response({"message": "Match result updated successfully"}, status=200)

    except :
        return Response({"message": "Either matchID or winnerID not valid"}, status=404)
