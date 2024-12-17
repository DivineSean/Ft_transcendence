from channels.consumer import async_to_sync
import redis
from django.conf import settings
from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer

class Command(BaseCommand):
    help = "Listen for Redis key expiry events"

    def handle(self, *args, **options):
        r = redis.StrictRedis(
            host=settings.REDIS_CONNECTION["host"],
            port=settings.REDIS_CONNECTION["port"],
            password=settings.REDIS_CONNECTION["password"],
            db=settings.REDIS_CONNECTION["db"],
            decode_responses=True,
        )
        pubsub = r.pubsub()
        pubsub.psubscribe(f"__keyevent@{settings.REDIS_CONNECTION['db']}__:expired")

        self.stdout.write("Listening for Redis key expiry events...")

        for message in pubsub.listen():
            if message["type"] == "pmessage":
                key = message["data"]
                if key.startswith("game_room_state:"):
                    game_room_id = key.split(":")[1]
                    self.mark_game_room_as_expired(game_room_id)

    def mark_game_room_as_expired(self, game_room_id):
        # Mark the game room as expired in the database
        from games.models import GameRoom  # Import within function to avoid circular imports
        try:
            game_room = GameRoom.objects.get(id=game_room_id)
            game_room.status = "expired"
            game_room.save()
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"game_room_{game_room_id}",
                {
                    "type": "broadcast",
                    "info": "game_room_expired",
                    "message": {},
                }
            )
            self.stdout.write(f"Marked GameRoom {game_room_id} as expired.")
        except GameRoom.DoesNotExist:
            self.stdout.write(f"GameRoom {game_room_id} does not exist.")
