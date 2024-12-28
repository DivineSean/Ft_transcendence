from django.urls import path
from . import consumers

ws_urlpatterns = [
    path("ws/games/<str:room_uuid>", consumers.GameConsumer.as_asgi()),
]