from django.urls import path, include
from . import views


urlpatterns = [
    path("api/tournaments/", views.Tournaments.as_view(), name="Tournaments"),
    path("api/tournaments/<int:offset>/", views.Tournaments.as_view(), name="Tournaments"),
    # path("tournament/", views.tournament_view, name="tournament_view"),  # ghayt7yd mn b3d
    # path("api/tournament/list/", views.listTournaments, name="listTournaments"),
]
