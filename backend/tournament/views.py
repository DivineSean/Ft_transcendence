from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Lobby, Player
from uuid import UUID
from .models import Match
import math
from .manager import TournamentManager

# from django.http import HttpResponse


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

    existingLobby = Lobby.objects.filter(
        creator=request._user, isCompleted=False
    ).first()

    if existingLobby:
        return Response(
            {
                "message": "User already has active tournament",
                "lobbyID": str(existingLobby.lobbyID),
            }
        )

    newLobby = Lobby.objects.create(creator=request._user, maxPlayers=maxPlayers)
    newLobby.addPlayer(request._user)

    return Response(
        {"message": "Lobby created successfully", "lobbyID": str(newLobby.lobbyID)},
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
        lobby = Lobby.objects.get(lobbyID=lobbyID)
    except:
        return Response("No Lobby with this lobbyID", status=400)

    managerObj = TournamentManager(lobby).startGame()

    playerObj = lobby.addPlayer(request.user)

    if lobby.currentPlayerCount == lobby.maxPlayers:

        createBracket(lobby)
        # matches = Match.objects.filter(lobby=lobby).select_related('player1', 'player2', 'winner') i try this mn b3d
        # matches = Match.objects.filter(lobby=lobby)
        managerObj = TournamentManager(lobby).startGame()
        # return Response({
        #     "message": f'{playerObj[0]}',
        #     "matches": [{
        #         'id': match.id,
        #         'tnRound': match.tnRound,
        #         'player1': {
        #             'id': match.player1.id,
        #             'username': match.player1.user.username,
        #             'isEliminated': match.player1.isEliminated
        #         },
        #         'player2': {
        #             'id': match.player2.id,
        #             'username': match.player2.user.username,
        #             'isEliminated': match.player2.isEliminated
        #         } if match.player2 else None,
        #         'winner': {
        #             'id': match.winner.id,
        #             'username': match.winner.user.username
        #         } if match.winner else None
        #     } for match in matches]
        # }, status=int(playerObj[1]))

    return Response({"message": f"{playerObj[0]}"}, status=int(playerObj[1]))


@api_view(["GET"])
def deleteTournament(request):
    try:
        lobby = Lobby.objects.get(creator=request._user)
    except:
        return Response("No Lobby created by this Uuser", status=400)
    lobby.delete()
    return Response({"Lobby Deleted"}, status=200)


def createBracket(lobby):

    players = list(lobby.players.all())  # example la kano 4 players = [p1,p2,p3,p4]

    numRounds = int(
        math.log2(len(players))
    )  # Reminder al kosala, logarithm howa l power d n , so ila user choosa tournament d 4 , then 2 rounds exists, 8 => 3 rounds exists, 16 => 4 rounds exists

    for num in range(numRounds):  # numRounds = 2 | maxplayers = 4

        createMatches(
            lobby, players, num + 1
        )  # in case numRounds = 2 donc num = 1 first round, num = 2 second round
    players = lobby.players.all()
    usernames = [player.user.email for player in players]
    print(usernames, flush=True)


def createMatches(lobby, players, roundNum):
    # matches = []

    for i in range(0, len(players), 2):  # 2 b 2  (i = 0 then 2 in case len = 4)
        p1 = players[i]  # 0 then  2

        if i + 1 < len(players):  # i = 1 then 3
            p2 = players[i + 1]  # 1 then 3
        else:
            p2 = None

        # match = we dont need match for now
        Match.objects.create(
            lobby=lobby,  # same lobby logic
            player1=p1,  # 0, 2 (ids)
            player2=p2,  # 1, 3 (kandwi 3la l ids)
            tnRound=roundNum,  # 1 the 2
        )
        # normalement hna khas n sendi l game l markik

        # matches.append(match) # no need daba


@api_view(["POST"])
def MarkikDirChi9lwa(request):

    matchID = request.data.get("matchID")
    winnerID = request.data.get("winnerID")

    try:
        match = Match.objects.get(id=matchID)
        winner = Player.objects.get(id=winnerID)

        # maybe khsni n checki wach match + winners kaynin fl game

        match.winner = winner
        match.save()

        # loser = match.player2 if match.player1.id == winner.id else match.player1
        if match.player1 != winner:
            loser = match.player1
        else:
            loser = match.player2

        loser.isEliminated = True
        loser.save()

        # kan checki wach current round salat
        currentRoundIncomplete = Match.objects.filter(
            lobby=match.lobby, tnRound=match.tnRound, winner__isnull=True
        ).exists()

        if not currentRoundIncomplete:
            # kan stori winners f lista
            currentRoundWinners = Match.objects.filter(
                lobby=match.lobby, tnRound=match.tnRound
            ).values_list("winner", flat=True)

            # ila kan kter mn winner, creer matches jdad
            if len(currentRoundWinners) > 1:
                winners = Player.objects.filter(id__in=currentRoundWinners)
                createMatches(match.lobby, list(winners), match.tnRound + 1)
            else:
                # TN sala
                match.lobby.isCompleted = True
                match.lobby.winner = winner
                match.lobby.save()

        return Response({"message": "Match result updated successfully"}, status=200)

    except Match.DoesNotExist:
        return Response({"message": "Match not found"}, status=404)
    except Player.DoesNotExist:
        return Response({"message": "Player not found"}, status=404)


def tournament_view(request):
    return render(request, "tournaments/tournament.html")


@api_view(["GET"])
def listTournaments(request):
    tournaments = Lobby.objects.filter(isCompleted=False).values(
        "lobbyID", "maxPlayers"
    )
    return Response(list(tournaments))
