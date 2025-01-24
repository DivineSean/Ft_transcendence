from django.db import models
from authentication.models import User
from games.models import GameRoom, Player, Game
from django.conf import settings
import uuid
import redis
import json
import math

r = redis.Redis(
    host=settings.REDIS_CONNECTION["host"],
    port=settings.REDIS_CONNECTION["port"],
    password=settings.REDIS_CONNECTION["password"],
    db=settings.REDIS_CONNECTION["db"],
    decode_responses=True,
)


class Tournament(models.Model):
    id = models.UUIDField(
        default=uuid.uuid4, unique=True, primary_key=True, editable=False
    )
    creator = models.ForeignKey(
        User, related_name="created_tournaments", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now=True)
    maxPlayers = models.PositiveIntegerField()
    currentPlayerCount = models.PositiveIntegerField(default=0)
    current_round = models.PositiveIntegerField(default=1)
    total_rounds = models.PositiveIntegerField()
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    isCompleted = models.BooleanField(default=False)
    isStarted = models.BooleanField(default=False)
    tournamentTitle = models.TextField(max_length=15)
    isCanceled = models.BooleanField(default=False)
    winner = models.ForeignKey(
        User,
        null=True,
        blank=True,
        related_name="tournaments_won",
        on_delete=models.SET_NULL,
    )

    def addPlayer(self, user):
        if self.currentPlayerCount >= self.maxPlayers:
            return ["Tournament is full", 400]

        if tournamentPlayer.objects.filter(tournament=self, user=user).exists():
            return ["Player already in tournament", 400]

        tournamentPlayer.objects.create(
            tournament=self,
            user=user,
        )
        self.currentPlayerCount += 1
        self.save()

        if self.currentPlayerCount == self.maxPlayers:
            self.createBracket(self.current_round)

        return ["Player successfully added", 201]

    def createBracket(self, round_number):
        return Bracket.objects.create(tournament=self, round_number=round_number)

    def advanceRound(self, lenWinners):
        logWinners = int(math.log2(lenWinners))

        self.current_round = int(math.log2(self.maxPlayers)) - logWinners + 1
        self.save()
        return self.createBracket(self.current_round)


class tournamentPlayer(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.PositiveIntegerField(blank=True, null=True)


class Bracket(models.Model):
    tournament = models.ForeignKey(
        "Tournament", related_name="brackets", on_delete=models.CASCADE
    )
    round_number = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def getWinners(self):
        game_rooms = GameRoom.objects.filter(
            bracket=self,
            status__in=[GameRoom.Status.COMPLETED, GameRoom.Status.EXPIRED],
        )

        winner_user_ids = []
        all_user_ids = []

        for game_room in game_rooms:
            if game_room.status == GameRoom.Status.COMPLETED:
                allPlayers = json.loads(
                    r.hget(f"game_room_data:{game_room.id}", "players")
                )
            else:
                allPlayers = Player.objects.filter(game_room=game_room)

            for p in allPlayers:
                if game_room.status == GameRoom.Status.COMPLETED:
                    result = p["result"]
                    user_id = p["user"]["id"]
                else:
                    result = p.result
                    user_id = p.user_id

                if result == Player.Result.WIN:
                    winner_user_ids.append(user_id)
                if result in [Player.Result.WIN, Player.Result.DISCONNECTED]:
                    all_user_ids.append(user_id)

        tournament_players = tournamentPlayer.objects.filter(
            tournament=self.tournament, user_id__in=winner_user_ids
        ).select_related("user")

        winners = (
            Player.objects.filter(
                user_id__in=winner_user_ids,
                game_room__bracket=self,
            )
            .select_related("user")
            .order_by()
        )

        sorted_winners = sorted(
            winners,
            key=lambda player: next(
                (tp.role for tp in tournament_players if tp.user_id == player.user_id),
                None,
            ),
        )

        all_players = (
            Player.objects.filter(user_id__in=all_user_ids, game_room__bracket=self)
            .select_related("user")
            .order_by()
        )

        tournament_players = tournamentPlayer.objects.filter(
            tournament=self.tournament, user_id__in=all_user_ids
        ).select_related("user")

        sorted_all_data = sorted(
            all_players,
            key=lambda player: next(
                (tp.role for tp in tournament_players if tp.user_id == player.user_id),
                None,
            ),
        )

        return sorted_winners, sorted_all_data

    def isComplete(self):
        return not GameRoom.objects.filter(
            bracket=self,
            status__in=[
                GameRoom.Status.WAITING,
                GameRoom.Status.ONGOING,
                GameRoom.Status.PAUSED,
            ],
        ).exists()
