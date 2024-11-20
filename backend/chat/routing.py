from django.urls import path, re_path

from .consumers import Chat
#expects https connection 
chat_urlpatterns = [
    # re_path(r'ws/chat/(?P<room_name>\w+)/$', Chat.as_asgi()),
		path('ws/chat/<str:room_name>/', Chat.as_asgi()),
]