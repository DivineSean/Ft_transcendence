from django.urls import path

from .consumers import Chat

# expects https connection
chat_urlpatterns = [
    path("ws/chat/", Chat.as_asgi()),
]
