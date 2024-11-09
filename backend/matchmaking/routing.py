from django.urls import path
from . import consumers

ws_urlpatterns = [
    path("ws/matchmaking/<str:game_name>", consumers.MatchmakingConsumer.as_asgi()),
]
