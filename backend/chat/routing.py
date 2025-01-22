from django.urls import path, re_path

from .consumers import Chat

# expects https connection
chat_urlpatterns = [
    path("ws/chat/", Chat.as_asgi()),
]
