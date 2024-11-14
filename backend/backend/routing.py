from django.urls import path,include
# from games.routing import ws_urlpatterns as game_urlpatterns
from chat.routing import chat_urlpatterns
# from chat.routing import *
# print(chat_urlpatterns, flush=True)
ws_urlpatterns = [
    # *game_urlpatterns,
    *chat_urlpatterns
]
