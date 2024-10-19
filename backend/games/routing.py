from django.urls import path
from . import consumers

ws_urlpatterns = [
    path("ws/games/", consumers.Test.as_asgi()),
]
