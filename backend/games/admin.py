from django.contrib import admin
from games.models import Game, Player, GameRoom, PlayerRating

# Register your models here.
admin.site.register(PlayerRating)
admin.site.register(GameRoom)
admin.site.register(Player)
admin.site.register(Game)
