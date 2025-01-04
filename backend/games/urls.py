from django.urls import path, include
from . import views

urlpatterns = [
    path(
        "api/games/<str:game_name>/invite/",
        views.inviteFriend,
        name="getFr",
    ),
]
