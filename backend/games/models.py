from django.db import models
from Auth.models import Users as User
import uuid

class   Game(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = 'Pending'
        IN_PROGRESS = 'In Progress'
        FINISHED = 'Finished'
        EXPIRED = 'Expired'

    class TypeChoices(models.TextChoices):
        PONG = 'Pong'
        # INFO: Add the other games later

    game_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    player_one = models.ForeignKey(User, related_name='player_one_games', on_delete=models.CASCADE)
    player_two = models.ForeignKey(User, related_name='player_two_games', on_delete=models.CASCADE)
    game_type = models.CharField(max_length=20)
    status = models.CharField(max_length=20 ,choices=StatusChoices.choices, default=StatusChoices.PENDING)
    player_one_score = models.IntegerField(default=0)
    player_two_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_winner(self):
        if self.player_one_score > self.player_two_score:
            return self.player_one
        elif self.player_two_score > self.player_one_score:
            return self.player_two
        else:
            return None

    def __str__(self):
        return f"{self.player_one} vs {self.player_two}"
