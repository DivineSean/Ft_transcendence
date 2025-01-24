from django.urls import path
from . import views

urlpatterns = [
    path(
        "api/games/<str:game_name>/invite/",
        views.inviteFriend,
        name="inviteFriend",
    ),
    path("api/matches/", views.getOnlineMatches, name="online matches"),
    path(
        "api/rankings/<str:game_name>/<int:offset>/",
        views.get_rankings,
        name="updateRankingsPage",
    ),
    path("api/profile/stats/<str:game_name>/",
         views.getStats, name="ProfileStats"),
    path(
        "api/profile/stats/<str:game_name>/<str:username>/",
        views.getStats,
        name="ProfileUserStats",
    ),
]
