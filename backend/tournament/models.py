from django.db import models
from authentication.models import User
from games.models import GameRoom, Player, Game
import uuid


class Tournament(models.Model):
    lobbyID = models.UUIDField(default=uuid.uuid4, unique=True)
    creator = models.ForeignKey(
        User, related_name="created_tournaments", on_delete=models.CASCADE
    )
    # game = models.ForeignKey(Game, on_delete=models.PROTECT)
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

        if self.currentPlayerCount >= self.maxPlayers:  # 4 / 8 / 16
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

    def advanceRound(self):
        print("Im in advanceRound")
        if self.current_round < self.total_rounds:
            self.current_round += 1
            self.save()
            return self.createBracket(self.current_round)
        return None


class tournamentPlayer(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class Bracket(models.Model):
    tournament = models.ForeignKey(
        "Tournament", related_name="brackets", on_delete=models.CASCADE
    )
    round_number = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def getWinners(self):

        return Player.objects.filter(
            game_room__bracket=self, result=Player.Result.WIN
        ).select_related("user").order_by("id"), Player.objects.filter(
            game_room__bracket=self, result=Player.Result.DISCONNECTED
        ).select_related(
            "user"
        ).order_by(
            "id"
        )

    def isComplete(self):
        return not GameRoom.objects.filter(
            bracket=self,
            status__in=[
                GameRoom.Status.WAITING,
                GameRoom.Status.ONGOING,
                GameRoom.Status.PAUSED,
            ],
        ).exists()
