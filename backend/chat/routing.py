from django.urls import path, re_path

from .consumers import Chat
#expects https connection 
chat_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', Chat.as_asgi()),

]