from django.urls import path, include
from . import views


urlpatterns = [
    path("api/tournament/create/", views.CreateTournament, name="CreateTournament"),
    path("api/tournament/addPlayer/", views.addPlayerToLobby, name="addPlayer"),
    path("api/tournament/delete/", views.deleteTournament, name="deleteLobby"),

]