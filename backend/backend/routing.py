from games.routing import ws_urlpatterns as game_urlpatterns
from matchmaking.routing import ws_urlpatterns as matchmaking_urlpatterns
from chat.routing import chat_urlpatterns
from django.urls import re_path
from channels.generic.websocket import WebsocketConsumer

class FallBackConsumer(WebsocketConsumer):
	def connect(self):
		self.close()

ws_urlpatterns = [
    *game_urlpatterns,
    *matchmaking_urlpatterns,
    *chat_urlpatterns,
		re_path(r"^.*$", FallBackConsumer.as_asgi()),
]
