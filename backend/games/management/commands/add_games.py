from django.core.management.base import BaseCommand
from games.models import Game
from django.db import IntegrityError


class Command(BaseCommand):
    help = "Adds initial games to the database if they don't exist."

    def handle(self, *args, **kwargs):
        initial_games = [
            {
                "name": "Pong",
                "min_players": 2,
                "max_players": 2,
                "description": "Ping-pong game",
            },
        ]

        for game_data in initial_games:
            try:
                game, created = Game.objects.get_or_create(
                    name=game_data["name"],
                    defaults={
                        "min_players": game_data["min_players"],
                        "max_players": game_data["max_players"],
                        "description": game_data["description"],
                    },
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Game '{game.name}' added."))
                else:
                    self.stdout.write(f"Game '{game.name}' already exists.")
            except IntegrityError:
                self.stdout.write(
                    self.style.ERROR(
                        f"Error: Could not create game '{game_data['name']}'."
                    )
                )
