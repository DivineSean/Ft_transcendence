from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from authentication.models import User
from games.models import Game, GameRoom, Player, PlayerRating
from games.serializers import GameRoomSerializer
from django.conf import settings
import redis
import json
from django.db import transaction
from django.db.transaction import on_commit
import logging

logger = logging.getLogger("uvicorn.error")

r = redis.Redis(
    host=settings.REDIS_CONNECTION["host"],
    port=settings.REDIS_CONNECTION["port"],
    password=settings.REDIS_CONNECTION["password"],
    db=settings.REDIS_CONNECTION["db"],
    decode_responses=True,
)


@shared_task
def mark_game_abandoned(game_room_id, user_id):
    from tournament.tasks import processGameResult
    from games.consumers import XP_GAIN_NORMAL, XP_GAIN_TN

    game_room_data = r.hgetall(f"game_room_data:{game_room_id}")
    if not game_room_data:
        return f"GameRoom {game_room_id} state not found."

    if game_room_data["status"] == GameRoom.Status.COMPLETED:
        return f"GameRoom {game_room_id} has already concluded."

    try:
        game_room = GameRoom.objects.get(id=game_room_id)
    except GameRoom.DoesNotExist:
        return f"GameRoom {game_room_id} does not exist."

    game_room_data["state"] = json.loads(game_room_data["state"])
    game_room_data["players"] = json.loads(game_room_data["players"])
    game_room_data["bracket"] = json.loads(game_room_data["bracket"])

    for player in game_room_data["players"]:
        user = User.objects.get(pk=player["user"]["id"])
        if player["user"]["id"] == user_id:
            player["result"] = Player.Result.LOSS
        else:
            player["result"] = Player.Result.WIN
            if game_room_data["bracket"] is not None:
                user.increase_exp(XP_GAIN_TN)
            else:
                user.increase_exp(XP_GAIN_NORMAL)
        PlayerRating.handle_rating(
            user, Game.objects.get(pk=game_room_data["game"]), player
        )
        # Back to Being Online Again
        user.update_status(User.Status.ONLINE)

    game_room_data["status"] = GameRoom.Status.COMPLETED
    serializer = GameRoomSerializer(game_room, data=game_room_data, partial=True)
    if serializer.is_valid():
        serializer.save()
        r.hset(f"game_room_data:{game_room_id}", mapping=serializer.data)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"game_room_{game_room_id}",
            {
                "type": "broadcast",
                "info": "game_manager",
                "message": game_room_data,
            },
        )

        if game_room.bracket is not None:
            print("ABANDONED TASK CALLED", flush=True)
            processGameResult(game_room_id)

        return f"GameRoom {game_room_id} marked as abandoned"
    else:
        return f"GameRoom {game_room_id} synching failed: {serializer.errors}"


@shared_task
def mark_game_room_as_expired(game_room_id):
    from tournament.tasks import processGameResult

    try:
        game_room = GameRoom.objects.get(id=game_room_id)
        if game_room.status != "waiting":
            return f"GameRoom {game_room_id} has already expired."

        if game_room.bracket is not None:
            try:
                with transaction.atomic():
                    players = Player.objects.select_for_update().filter(
                        game_room=game_room
                    )

                    for player in players:
                        player.result = (
                            Player.Result.WIN
                            if player.ready
                            else Player.Result.DISCONNECTED
                        )
                        try:
                            user = User.objects.get(pk=player.user.id)
                            user.update_status(User.Status.ONLINE)
                        except Exception as e:
                            print(e, flush=True)

                        player.save()
                        # gr = str(game_room_id)
                        # id = str(player.user.id)
                        # res = str(player.result)

                    game_room.status = "expired"
                    game_room.save()
                    r.hset(f"game_room_data:{game_room_id}", "status", "expired")

                    channel_layer = get_channel_layer()
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

                    # print("PLAYERR = ", id, type(id), flush=True)
                    # print("game_room_id = ", gr, type(gr), flush=True)
                    # print("result = ", res, type(res), flush=True)
                    print("COMMITED====", flush=True)
                    on_commit(lambda: processGameResult(game_room_id))
                    print("ON_COMMIT CALLED", flush=True)

                    return f"tournament GameRoom {game_room_id} marked as expired."
            except Exception as e:
                return f"Unexpected exception while trying to save players result: {str(e)}"
        else:
            players = Player.objects.filter(game_room=game_room)

        game_room.status = "expired"
        game_room.save()

        # Change user status (in-game -> online/offline)
        for player in players:
            try:
                user = User.objects.get(pk=player.user.id)
                user.update_status(User.Status.ONLINE)
            except Exception as e:
                print(e, flush=True)

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
    game_room_data = r.hgetall(f"game_room_data:{game_room_id}")
    if not game_room_data:
        return f"GameRoom {game_room_id} state not found."

    try:
        game_room = GameRoom.objects.get(id=game_room_id)
    except GameRoom.DoesNotExist:
        return f"GameRoom {game_room_id} does not exist."

    game_room_data["state"] = json.loads(game_room_data["state"])
    game_room_data["players"] = json.loads(game_room_data["players"])
    game_room_data["bracket"] = json.loads(game_room_data["bracket"])
    serializer = GameRoomSerializer(game_room, data=game_room_data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return f"GameRoom {game_room_id} synched successfully"
    else:
        return f"GameRoom {game_room_id} synching failed: {serializer.errors}"
