from django.contrib import admin
from .models import Tournament, tournamentPlayer, Bracket

admin.site.register(Tournament)
admin.site.register(tournamentPlayer)
admin.site.register(Bracket)



# Register your models here.
