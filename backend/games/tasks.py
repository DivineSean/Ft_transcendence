from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from games.models import GameRoom
from games.consumers import r

@shared_task
def mark_game_room_as_expired(game_room_id):
    try:
        game_room = GameRoom.objects.get(id=game_room_id)
        if game_room.status == "waiting":
            game_room.status = "expired"
            game_room.save()

            channel_layer = get_channel_layer()
            r.hset(f"game_room_state:{game_room_id}", "status", "expired")
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
