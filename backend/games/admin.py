from django.contrib import admin
from games.models import Game, Player, GameRoom, PlayerRating, Achievement, PlayerAchievement

# Register your models here.
admin.site.register(Achievement)
admin.site.register(PlayerAchievement)
admin.site.register(PlayerRating)
admin.site.register(GameRoom)
admin.site.register(Player)
admin.site.register(Game)
