from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import Tournament
from uuid import UUID
import math
from .manager import manageTournament
from .serializers import (
    getTournamentSerializer,
    TournamentDataSerializer,
)
from rest_framework.pagination import PageNumberPagination
from games.models import Game
from .models import Bracket
from django.db.models import Q


class Tournaments(APIView):

    def get(self, request, offset=0):
        try:
            tournamentsData = getTournamentSerializer(
                Tournament.objects.all().order_by("-created_at"),
                many=True,
                context=request._user,
            ).data
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        paginator = PageNumberPagination()
        try:
            paginator.page_size = int(request.data.get("limit", 20))

        except ValueError:
            return Response(
                {"Error": "Either Offeset or limit is not a Number"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        paginatedTournaments = tournamentsData[offset : offset + paginator.page_size]

        return Response(
            {
                "tournaments": paginatedTournaments,
                "nextOffset": (
                    offset + paginator.page_size
                    if len(paginatedTournaments) == paginator.page_size
                    else 0
                ),
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, tournament_id=None):

        if not tournament_id:
            return Response(
                "No tournament id provided",
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not tournament.isStarted:
            tournament.delete()

        elif tournament.isStarted:
            return Response(
                {"error": "Can't delete a started Tournament"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        else:
            tournament.delete()

        return Response({"message": "Tournament Deleted"}, status=status.HTTP_200_OK)

    def post(self, request):
        maxPlayers = request.data.get("maxPlayers")
        if not maxPlayers or not str(maxPlayers).isdigit():
            return Response(
                {"error": "maxPlayers not specified or not a number"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        maxPlayers = int(maxPlayers)
        if maxPlayers not in [4, 8, 16]:
            return Response(
                {"error": "maxPlayers must be 4, 8, or 16"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tournamentName = request.data.get("tournamentName")
        if not tournamentName:
            return Response(
                {"error": "Tournament Name not specified"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        game = request.data.get("game")
        if not game:
            return Response(
                {"error": "no game provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        if Tournament.objects.filter(tournamentTitle=tournamentName):
            return Response(
                {"error": "This Tournament Already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_tournament = Tournament.objects.filter(
            Q(isCompleted=False) & Q(isCanceled=False),
            creator=request._user,
        ).first()

        if existing_tournament:
            return Response(
                {
                    "error": "User already has active tournament",
                    "id": str(existing_tournament.id),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            new_tournament = Tournament.objects.create(
                creator=request._user,
                maxPlayers=maxPlayers,
                total_rounds=int(math.log2(maxPlayers)),
                tournamentTitle=tournamentName,
                game=Game.objects.get(name=game),
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        new_tournament.addPlayer(request._user)

        return Response(
            {
                "message": "Tournament created successfully",
                "id": str(new_tournament.id),
            },
            status=status.HTTP_201_CREATED,
        )

    def put(self, request):
        id = request.data.get("id")
        if not id:
            return Response(
                {"error": "id required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            UUID(id)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tournament = Tournament.objects.get(id=id)
        except:
            return Response(
                {"error": "No Tournament with this id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        playerObj = tournament.addPlayer(request.user)
        if int(playerObj[1]) == 400:
            response = Response({"error": f"{playerObj[0]}"}, status=int(playerObj[1]))
        else:
            response = Response(
                {"message": f"{playerObj[0]}"}, status=int(playerObj[1])
            )

        if tournament.currentPlayerCount == tournament.maxPlayers:
            if tournament.isStarted is True:
                return Response(
                    {"error": "Player already in Tournament"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            manageTournament(tournament.id)
            tournament.isStarted = True
            tournament.save()
        return response


@api_view(["GET"])
def getTournamentData(request, id=None):
    if not id:
        return Response(
            {"error": "No Tournament ID"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        tournamentObj = Tournament.objects.get(id=id)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    brackets = Bracket.objects.filter(tournament=tournamentObj).order_by("round_number")

    serializer = TournamentDataSerializer(
        {
            "brackets": brackets,
            "totalRounds": tournamentObj.total_rounds,
            "maxPlayers": tournamentObj.maxPlayers,
            "currentPlayerCount": tournamentObj.currentPlayerCount,
            "isCompleted": tournamentObj.isCompleted,
        }
    )
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def getUpcomingTournament(request):
    try:
        tournament = (
            Tournament.objects.filter(
                isStarted=False,
                isCanceled=False,
                isCompleted=False,
            )
            .order_by("-currentPlayerCount")
            .first()
        )

        if not tournament:
            return Response({}, status=status.HTTP_200_OK)

        tournamentData = getTournamentSerializer(
            tournament,
            context=request._user,
        ).data
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        tournamentData,
        status=status.HTTP_200_OK,
    )
