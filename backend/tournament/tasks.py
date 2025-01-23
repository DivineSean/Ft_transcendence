from tournament.manager import TournamentManager
from games.models import GameRoom


def processGameResult(game_room_id):

    game_room = GameRoom.objects.select_related("bracket__tournament").get(
        id=game_room_id
    )

    if not game_room.bracket:
        return "Not a tournament game"

    manager = TournamentManager(game_room.bracket.tournament.id)
    manager.handle_game_completion(game_room_id)


def manageTournament(tournament_id):

    manager = TournamentManager(tournament_id)
    manager.initialize_matches()
