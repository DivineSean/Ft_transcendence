from celery import shared_task
from tournament.manager import TournamentManager
from games.models import GameRoom


@shared_task
def manageTournament(tournamentID):

    manager = TournamentManager(tournamentID["lobbyID"])

    manager.initialize_matches()


@shared_task
def processGameResult(game_room_id):
    game_room = GameRoom.objects.select_related("bracket__tournament").get(
        id=game_room_id
    )

    if not game_room.bracket:  # wach tournament or not
        return "Nadafak bro"

    manager = TournamentManager(game_room.bracket.tournament.lobbyID)
    manager.handle_game_completion(game_room_id)
