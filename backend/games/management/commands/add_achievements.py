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
                    "description": "Score 3 untouched serves in a single match to prove your serving mastery. The opponent should not make contact with any of these serves.",
                },
                {
                    "name": "The Marathoner",
                    "description": "Win a match that lasts 5 minutes or longer. Endurance and consistency are key to outlasting your opponent in these epic rallies.",
                },
                {
                    "name": "The Dominator",
                    "description": "Crush your opponent with a flawless 7-0 victory and claim ultimate bragging rights!",
                },
                {
                    "name": "The Bounceback Boss",
                    "description": "Defy the odds! Overcome a 4-goal deficit and stage an epic comeback to seize victory!",
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
