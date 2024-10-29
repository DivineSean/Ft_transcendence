from django.urls import path
from . import consumers

ws_urlpatterns = [
    path("ws/match/", consumers.MatchmakingConsumer.as_asgi()),
]
