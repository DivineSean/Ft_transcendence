from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from games.models import GameRoom
from games.serializers import GameRoomSerializer
from django.conf import settings
import redis

r = redis.Redis(
    host=settings.REDIS_CONNECTION["host"],
    port=settings.REDIS_CONNECTION["port"],
    password=settings.REDIS_CONNECTION["password"],
    db=settings.REDIS_CONNECTION["db"],
    decode_responses=True,
)


@shared_task
def mark_game_room_as_expired(game_room_id):
    try:
        game_room = GameRoom.objects.get(id=game_room_id)
        if game_room.status == "waiting":
            game_room.status = "expired"
            game_room.save()

            channel_layer = get_channel_layer()
            r.hset(f"game_room_data:{game_room_id}", "status", "expired")
            async_to_sync(channel_layer.group_send)(
                f"game_room_{game_room_id}",
                {
                    "type": "broadcast",
                    "info": "game_manager",
                    "message": {
                        "status": "expired",
                    },
                },
            )
            return f"GameRoom {game_room_id} marked as expired."
    except GameRoom.DoesNotExist:
        return f"GameRoom {game_room_id} does not exist."


@shared_task
def sync_game_room_data(game_room_id):
    # INFO : gets game room state from redis, then updates the state field in the database accordingly
    game_room_state = r.hgetall(f"game_room_data:{game_room_id}")
    if not game_room_state:
        return f"GameRoom {game_room_id} state not found."

    try:
        game_room = GameRoom.objects.get(id=game_room_id)
    except GameRoom.DoesNotExist:
        return f"GameRoom {game_room_id} does not exist."

    serializer = GameRoomSerializer(game_room, data=game_room_state, partial=True)
    if serializer.is_valid():
        serializer.save()
        return f"GameRoom {game_room_id} synched successfully"
    else:
        return f"GameRoom {game_room_id} synching failed: {serializer.errors}"
