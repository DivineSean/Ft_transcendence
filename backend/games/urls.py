from django.urls import path, include
from . import views

urlpatterns = [
    path(
        "api/games/<str:game_name>/invite/",
        views.inviteFriend,
        name="getFr",
    ),
    path("api/matches/", views.getOnlineMatches, name="online matches"),
    path(
        "api/rankings/<str:game_name>/", views.get_rankings, name="updateRankingsPage"
    ),
]
