from django.urls import path
from . import views


urlpatterns = [
    path("api/tournament/<str:id>/", views.getTournamentData, name="getTournamentData"),
    path(
        "api/tournaments/upcoming/",
        views.getUpcomingTournament,
        name="getUpcomingTournament",
    ),
    path("api/tournaments/", views.Tournaments.as_view(), name="Tournaments"),
    path(
        "api/tournaments/<uuid:tournament_id>/",
        views.Tournaments.as_view(),
        name="Tournaments",
    ),
    path(
        "api/tournaments/<int:offset>/", views.Tournaments.as_view(), name="Tournaments"
    ),
]
