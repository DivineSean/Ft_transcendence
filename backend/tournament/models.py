from django.db import models
from authentication.models import User
from games.models import GameRoom, Player, Game
import uuid
import redis
import json
from django.conf import settings

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
        # random
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

#pls mat9is walo mn hadchi tanji ngado 
class Bracket(models.Model):
    tournament = models.ForeignKey(
        "Tournament", related_name="brackets", on_delete=models.CASCADE
    )
    round_number = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def getWinners(self):
        listofGameRooms = GameRoom.objects.filter(bracket = self, status__in=[GameRoom.Status.COMPLETED, GameRoom.Status.EXPIRED])

        
        winners = []
        allData = []

        for gameRoom in listofGameRooms:
            if gameRoom.status == GameRoom.Status.COMPLETED:
                allPlayers = json.loads(r.hget(f"game_room_data:{gameRoom.id}", "players"))
            else:
                allPlayers = Player.objects.filter(game_room = gameRoom)    
            for p in allPlayers:
                if gameRoom.status == GameRoom.Status.COMPLETED:
                    result = p["result"]
                    player = Player.objects.get(user__id=p["user"]["id"], game_room=gameRoom)
                else:
                    result = p.result
                    player = p

                if result == Player.Result.WIN:
                    winners.append(player)
                if result in [Player.Result.WIN, Player.Result.DISCONNECTED]: 
                    allData.append(player)
                


        print("Winners =>   ",winners, flush=True)
        print("allData =>   ",allData, flush=True)
  
        return winners, allData  
 
    def isComplete(self):
        return not GameRoom.objects.filter(
            bracket=self,
            status__in=[
                GameRoom.Status.WAITING,
                GameRoom.Status.ONGOING,
                GameRoom.Status.PAUSED,
            ],
        ).exists()
