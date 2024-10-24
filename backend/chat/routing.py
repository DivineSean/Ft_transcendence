from django.urls import path, re_path

from . import consumers
#expects https connection 
chat_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.Chat.as_asgi()),

]