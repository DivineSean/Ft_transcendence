from django.contrib import admin
from games.models import Game, GameRoom, PlayerRating

# Register your models here.
admin.site.register(PlayerRating)
admin.site.register(GameRoom)
admin.site.register(Game)
