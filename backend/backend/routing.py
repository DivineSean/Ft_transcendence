from games.routing import ws_urlpatterns as game_urlpatterns
from matchmaking.routing import ws_urlpatterns as matchmaking_urlpatterns
from chat.routing import chat_urlpatterns

ws_urlpatterns = [
    *game_urlpatterns,
    *matchmaking_urlpatterns,
    *chat_urlpatterns
]