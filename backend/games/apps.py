from django.apps import AppConfig
import threading


class GamesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "games"

    def ready(self):
        from games.management.commands.listen_redis_events import Command
        threading.Thread(target=Command().handle, daemon=True).start()
