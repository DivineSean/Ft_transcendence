from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from games.models import GameRoom, Player
from games.serializers import GameRoomSerializer
from django.conf import settings
import redis
import json

r = redis.Redis(
    host=settings.REDIS_CONNECTION["host"],
    port=settings.REDIS_CONNECTION["port"],
    password=settings.REDIS_CONNECTION["password"],
    db=settings.REDIS_CONNECTION["db"],
    decode_responses=True,
)


@shared_task
def mark_game_abandoned(game_room_id, user_id):
    try:
        game_room = GameRoom.objects.prefetch_related(
            'player_set').get(id=game_room_id)

        serialized_game_room = GameRoomSerializer(game_room)
        print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
              serialized_game_room.data, flush=True)
        players_details = json.loads(
            serialized_game_room.data['players_details'])

        # Find the leaving player
        leaving_player = next(
            (player for player in players_details if player['user']["id"] == user_id), None
        )
        if not leaving_player:
            return f"Player {user_id} does not exist."

        # Mark leaving player as lost
        leaving_player["result"] = Player.Result.LOSS
        Player.objects.filter(id=leaving_player['id']).update(
            result=Player.Result.LOSS)

        # Determine outcomes for remaining players
        remaining_players = [
            player for player in players_details if player['user']["id"] != user_id
        ]

        if len(remaining_players) == 1:
            # Single remaining player wins
            remaining_players[0]["result"] = Player.Result.WIN
            Player.objects.filter(id=remaining_players[0]['id']).update(
                result=Player.Result.WIN)
        else:
            # Multiple remaining players, assign draw
            Player.objects.filter(
                id__in=[player['id'] for player in remaining_players]
            ).update(result=Player.Result.DRAW)
            for player in remaining_players:
                player['result'] = Player.Result.DRAW

        # Update game room status
        game_room.status = GameRoom.Status.COMPLETED
        # r.delete(f"game_room_data:{game_room_id}")
        game_room.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"game_room_{game_room_id}",
            {
                "type": "broadcast",
                "info": "game_manager",
                "message": {
                        "players_details": [leaving_player] + remaining_players,
                        "status": "completed",
                },
            },
        )

        return f"GameRoom {game_room_id} marked as {game_room.status}."
    except GameRoom.DoesNotExist:
        return f"GameRoom {game_room_id} does not exist."


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

    game_room_state["state"] = json.loads(game_room_state["state"])
    game_room_state["players"] = json.loads(game_room_state["players"])
    serializer = GameRoomSerializer(
        game_room, data=game_room_state, partial=True)
    if serializer.is_valid():
        serializer.save()
        return f"GameRoom {game_room_id} synched successfully"
    else:
        return f"GameRoom {game_room_id} synching failed: {serializer.errors}"
