import redis
import json
import time
from threading import Lock, Thread
from django.core.management.base import BaseCommand
from django.conf import settings
from games.models import GameRoom


class Command(BaseCommand):
    help = "Flush game state updates to the database"

    def __init__(self):
        super().__init__()
        self.buffer = {}
        self.lock = Lock()
        self.running = True

    def handle(self, *args, **options):
        self.stdout.write("Starting batched database updater...")

        thread = Thread(target=self.periodic_flush, daemon=True)
        thread.start()

        r = redis.StrictRedis(
            host=settings.REDIS_CONNECTION["host"],
            port=settings.REDIS_CONNECTION["port"],
            password=settings.REDIS_CONNECTION["password"],
            db=settings.REDIS_CONNECTION["db"],
            decode_responses=True,
        )
        pubsub = r.pubsub()
        pubsub.subscribe("game_updates")

        try:
            for message in pubsub.listen():
                if message["type"] == "message":
                    print("updater ---------> ", message, flush=True)
                    self.buffer_update(json.loads(message["data"]))
        except KeyboardInterrupt:
            self.stdout.write("Shutting down updater...")
            self.running = False

    def buffer_update(self, data):
        game_room_id = data["game_room_id"]
        state = data["state"]

        with self.lock:
            self.buffer[game_room_id] = state

    def periodic_flush(self):
        while self.running:
            time.sleep(60)
            with self.lock:
                updates = self.buffer.copy()
                self.buffer.clear()

            if updates:
                self.flush_to_db(updates)

    def flush_to_db(self, updates):
        for game_room_id, state in updates.items():
            try:
                game_room = GameRoom.objects.get(id=game_room_id)
                game_room.state = state
                game_room.save()
                self.stdout.write(f"GameRoom {game_room_id} updated successfully.")
            except GameRoom.DoesNotExist:
                self.stderr.write(f"GameRoom {game_room_id} does not exist.")
