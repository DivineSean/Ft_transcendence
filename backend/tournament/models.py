from django.db import models
from authentication.models import User
from games.models import GameRoom, Player, Game
import uuid
import redis
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
        listofGameRooms = GameRoom.objects.filter(bracket = self, status=GameRoom.Status.COMPLETED)
        # 1 2 
        listofExpired = GameRoom.objects.filter(bracket = self, status=GameRoom.Status.EXPIRED)

        print("LIST EXPIRED",  listofExpired, flush=True)
        #data
        winners = []
        allData = []
        for gameRoom in listofGameRooms:
            all_players = Player.objects.filter(game_room = gameRoom)
            for player_id in all_players:
                if (player_id.result == "win"):
                    print("HEERE WIIN", flush=True)
                    winners.append(Player.objects.get(user__id=player_id.user.id, game_room=gameRoom))
                    allData.append(Player.objects.get(user__id=player_id.user.id, game_room=gameRoom))
   

        for gr in listofExpired:
            all_players = Player.objects.filter(game_room = gr)
            for player_id in all_players:
                print("TYPE PLAYER ID IS disc : ", type(player_id))
                if (player_id.result == "Disconnected"):
                    allData.append(Player.objects.get(user__id=player_id.user.id, game_room=gr))
                if (player_id.result == "win"):
                    allData.append(Player.objects.get(user__id=player_id.user.id, game_room=gr))
                    winners.append(Player.objects.get(user__id=player_id.user.id, game_room=gr))
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
