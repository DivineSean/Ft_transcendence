from django.urls import path,include
from games.routing import ws_urlpatterns as game_urlpatterns

ws_urlpatterns = [
    *game_urlpatterns,
]
