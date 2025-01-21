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
        # Back to Being Online Again
        r.rpush(f"game_room_data:{game_room_id}:players:{user_id}:result", player["result"])
        PlayerRating.handle_rating(
            user, Game.objects.get(pk=game_room_data["game"]), player
        )
        user.status = User.Status.ONLINE
        user.save()

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
            processGameResult.delay(game_room_id)

        return f"GameRoom {game_room_id} marked as abandoned"
    else:
        return f"GameRoom {game_room_id} synching failed: {serializer.errors}"


@shared_task
def mark_game_room_as_expired(game_room_id):
    from tournament.tasks import processGameResult  
    
    try:
        with transaction.atomic():
            game_room = GameRoom.objects.select_for_update().get(id=game_room_id)
            
            if game_room.status != "waiting":
                return f"GameRoom {game_room_id} is not in waiting status."        
            
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
        
            if game_room.bracket is not None:
          
                players = Player.objects.select_for_update().filter(game_room=game_room)
                
                for player in players:
                    player.result = (
                        Player.Result.WIN if player.ready 
                        else Player.Result.DISCONNECTED
                    )
                    gr = str(game_room_id)
                    id = str(player.user.id)
                    res= str(player.result)
                    r.rpush(
                        f"game_room_data:{gr}:players:{id}:result", 
                        str(r)
                    )
                    player.save()
                print("PLAYERR = " ,id, type(id), flush=True)
                print("game_room_id = " ,gr, type(gr), flush=True)
                print("result = ", res, type(res), flush=True)
                print("COMMITED====", flush=True)
                on_commit(lambda: processGameResult.delay(game_room_id))
                print("ON_COMMIT CALLED", flush=True)
                
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
