from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from .models import Tournament
from uuid import UUID
import math
from .tasks import manageTournament
from .serializers import TournamentSerializer, getTournamentSerializer
from rest_framework.pagination import PageNumberPagination, BasePagination
from games.models import Game

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

		def delete(self, request):
				try:
						tournament = Tournament.objects.filter(creator=request._user)
				except:
						return Response(
								"no tournament created by this Uuser", status=status.HTTP_400_BAD_REQUEST
						)
				tournament.delete()
				return Response({"Tournament Deleted"}, status=status.HTTP_200_OK)
		
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

					game = request.data.get('game')
					if not game:
						return Response(
							{'error': 'no game provided'},
							status=status.HTTP_400_BAD_REQUEST
						)
					if Tournament.objects.filter(tournamentTitle=tournamentName):
							return Response(
									{"error": "This Tournament Already exists"},
									status=status.HTTP_400_BAD_REQUEST,
							)

					existingLobby = Tournament.objects.filter(
							creator=request._user, isCompleted=False
					).first()

					if existingLobby:
							return Response(
									{
											"error": "User already has active tournament",
											"id": str(existingLobby.id),
									},
									status=status.HTTP_400_BAD_REQUEST,
							)
					try:
							newLobby = Tournament.objects.create(
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
					newLobby.addPlayer(request._user)

					return Response(
							{
									"message": "Tournament created successfully",
									"id": str(newLobby.id),
							},
							status=status.HTTP_201_CREATED,
					)
		
		def put(self, request):
				id = request.data.get("id")
				if not id:
						return Response(
							{"error": "id required"},
							status=status.HTTP_400_BAD_REQUEST
						)
				try:
						UUID(id)
				except Exception as e:
						return Response(
							{'error': str(e)},
							status=status.HTTP_400_BAD_REQUEST
						)

				try:
						lobby = Tournament.objects.get(id=id)
				except:
						return Response(
								{'error': "No Tournament with this id"},
								status=status.HTTP_400_BAD_REQUEST
						)

				playerObj = lobby.addPlayer(request.user)
				if int(playerObj[1]) == 400:
						response = Response(
							{"error": f"{playerObj[0]}"},
							status=int(playerObj[1])
						)
				else:
						response = Response(
							{"message": f"{playerObj[0]}"},
							status=int(playerObj[1])
						)

				if lobby.currentPlayerCount == lobby.maxPlayers:

						if lobby.isStarted == True:
								return Response(
										{"error": "Player already in Tournament"},
										status=status.HTTP_400_BAD_REQUEST,
								)
						tournamentID = TournamentSerializer(lobby).data
						manageTournament.delay(tournamentID)
						lobby.isStarted = True
						lobby.save()

				return response
				