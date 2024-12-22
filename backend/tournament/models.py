from django.db import models
from Auth.models import Users
import uuid

class Lobby(models.Model): 
    roomID = models.UUIDField(default=uuid.uuid4, unique=True) # i should rename it to lobbyID
    creator = models.ForeignKey(Users, related_name= "Users", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now=True)
    maxPlayers = models.PositiveBigIntegerField()
    currentPlayerCount = models.PositiveBigIntegerField(default=0)

    def addPlayer(self, player):
       
        if Player.objects.filter(tournament = self,  user = player).exists():
            return ["Player Already in tournament", 400]
        
        if self.currentPlayerCount >=  self.maxPlayers: 
            return ["Tournament is FULL", 400]
        
        Player.objects.create(
            tournament = self, user = player 
        )
        self.currentPlayerCount += 1
        self.save()

        return ["Player Added to the Tournament", 201]

class Player(models.Model):
    tournament = models.ForeignKey(Lobby, related_name="Lobby", on_delete=models.CASCADE)
    user = models.ForeignKey(Users, related_name="user",  on_delete=models.CASCADE)