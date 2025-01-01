from django.core.management.base import BaseCommand
from games.models import Game, Achievement
from django.db import IntegrityError


class Command(BaseCommand):
    help = "Adds achievements to the database if they don't exist."

    def handle(self, *args, **kwargs):
        achievements = {
            "pong": [
                {
                    "name": "The Serve Demon",
                    "description": "Nobody Can handle that kind of power!",
                },
                {
                    "name": "The Marathoner",
                    "description": "The game doesnt just need you—it thrives because of you!",
                },
                {
                    "name": "The Dominator",
                    "description": "You didnt win—you sent a message to everyone watching!",
                },
                {
                    "name": "The Bounceback Boss",
                    "description": "From the brink of defeat to total domination. Truly inspiring!",
                },
            ]
        }

        for game_name in achievements:
            try:
                game = Game.objects.get(name=game_name)
            except Game.DoesNotExist:
                self.style.ERROR(f"Error: game '{game_name}' does not exist.")
                continue

            for achievement in achievements[game_name]:
                try:
                    new_achievement, created = Achievement.objects.get_or_create(
                        game=game,
                        name=achievement["name"],
                        description=achievement["description"],
                    )
                    if created:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Achievement '{new_achievement.name}' added."
                            )
                        )
                    else:
                        self.stdout.write(
                            f"Achievement '{new_achievement.name}' already exists."
                        )
                except IntegrityError:
                    self.stdout.write(
                        self.style.ERROR(
                            f"Error: Could not create Achievement '{achievement['name']}'."
                        )
                    )
