from celery import shared_task
from tournament.manager import TournamentManager
from games.models import GameRoom
from django.conf import settings
import redis
from contextlib import contextmanager



r = redis.Redis(
    host=settings.REDIS_CONNECTION["host"],
    port=settings.REDIS_CONNECTION["port"],
    password=settings.REDIS_CONNECTION["password"],
    db=settings.REDIS_CONNECTION["db"],
    decode_responses=True,
)



# each game room => id => task
# @shared_task
def processGameResult(game_room_id):

    game_room = GameRoom.objects.select_related("bracket__tournament").get(
        id=game_room_id
    )

    if not game_room.bracket:
        return "Nadafak bro"

    manager = TournamentManager(game_room.bracket.tournament.id)
    manager.handle_game_completion(game_room_id)



def manageTournament(tournamentID):

    manager = TournamentManager(tournamentID["id"])
    manager.initialize_matches()
