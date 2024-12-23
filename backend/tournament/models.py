from django.db import models
from Auth.models import Users
import uuid

class Lobby(models.Model):
    lobbyID = models.UUIDField(default=uuid.uuid4, unique=True)  
    creator = models.ForeignKey(Users, related_name="created_tournaments", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now=True)
    maxPlayers = models.PositiveIntegerField() 
    currentPlayerCount = models.PositiveIntegerField(default=0)
    isCompleted = models.BooleanField(default=False)  
    winner = models.ForeignKey('Player', null=True, blank=True, related_name="TNwinner", on_delete=models.SET_NULL)  

    def addPlayer(self, player):
        if Player.objects.filter(tournament=self, user=player).exists():
            return ["Player already in tournament", 400]
        
        if self.currentPlayerCount >= self.maxPlayers:
            return ["Tournament is full", 400]
        
        Player.objects.create(
            tournament=self,
            user=player
        )
        self.currentPlayerCount += 1
        self.save()
        
        return ["Player added to the tournament", 201]

class Player(models.Model):
    tournament = models.ForeignKey(Lobby, related_name="players", on_delete=models.CASCADE)
    user = models.ForeignKey(Users, related_name="tournamentParticipations", on_delete=models.CASCADE)
    # isActive = models.BooleanField(default=True)  

    class Meta:
        unique_together = ['tournament', 'user'] 

class Match(models.Model):
    lobby = models.ForeignKey(Lobby, related_name="matches", on_delete=models.CASCADE)
    player1 = models.ForeignKey(Player, related_name="matches_p1", on_delete=models.CASCADE)
    player2 = models.ForeignKey(Player, related_name="matches_p2", on_delete=models.CASCADE, null=True)  # ma3rftch wach ghaykoun 3ndna byes situations
    winner = models.ForeignKey(Player, related_name="matches_won", on_delete=models.CASCADE, null=True, blank=True)
    tnRound = models.PositiveIntegerField()
    completed = models.BooleanField(default=False)



# class LocalPlayers:
#     # imaginary
# textField