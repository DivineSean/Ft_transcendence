from django.urls import path, include
from . import views


urlpatterns = [
    path("api/tournament/create/", views.CreateTournament, name="CreateTournament"),
    path("api/tournament/addPlayer/", views.addPlayerToLobby, name="addPlayer"),
    path("api/tournament/delete/", views.deleteTournament, name="deleteLobby"),
    path("api/tournament/updateBracket", views.MarkikDirChi9lwa, name="updateBracket"),
    path(
        "tournament/", views.tournament_view, name="tournament_view"
    ),  # ghayt7yd mn b3d
    path("api/tournament/list/", views.listTournaments, name="listTournaments"),
]
