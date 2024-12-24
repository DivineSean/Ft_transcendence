from django.db import models
from django.db.models.base import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
from Auth.models import Users as User
import uuid


class Game(models.Model):
    name = models.CharField(max_length=20, unique=True)
    min_players = models.PositiveSmallIntegerField(
        default=2,
        blank=False,
        null=False,
        help_text="Minimum number of players required to start the game",
    )
    max_players = models.PositiveSmallIntegerField(
        default=2,
        blank=False,
        null=False,
        help_text="Maximum players allowed in the game",
    )

    def clean(self):
        if self.min_players > self.max_players:
            return ValidationError("Max players cannot be less than min players.")

    def __str__(self):
        return self.name


class GameRoom(models.Model):
    class Status(models.TextChoices):
        WAITING = "waiting", "Waiting for Players"
        ONGOING = "ongoing", "Game Ongoing"
        PAUSED = "paused", "Game Paused"
        COMPLETED = "completed", "Game Completed"
        EXPIRED = "expired", "Game Expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    game = models.ForeignKey(Game, on_delete=models.PROTECT)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.WAITING
    )
    state = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)


class Player(models.Model):
    class Result(models.TextChoices):
        WIN = "win", "Win"
        LOSS = "loss", "Loss"
        DRAW = "draw", "Draw"

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game_room = models.ForeignKey(GameRoom, on_delete=models.CASCADE)
    rating_gain = models.PositiveSmallIntegerField()
    rating_loss = models.PositiveSmallIntegerField()
    role = models.PositiveSmallIntegerField()
    ready = models.BooleanField(default=False)
    score = models.PositiveIntegerField(default=0)
    result = models.CharField(
        max_length=10, choices=Result.choices, blank=True, null=True
    )


class PlayerRating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.PROTECT)
    rating = models.PositiveIntegerField(default=951)
    updated_at = models.DateTimeField(auto_now=True)


@receiver(post_save, sender=Game)
def create_player_ratings(sender, instance, created, **kwargs):
    if created:
        users = User.objects.all()
        PlayerRating.objects.bulk_create(
            [PlayerRating(user=user, game=instance) for user in users]
        )


@receiver(post_save, sender=User)
def create_player_ratings_for_user(sender, instance, created, **kwargs):
    if created:
        games = Game.objects.all()
        PlayerRating.objects.bulk_create(
            [PlayerRating(user=instance, game=game) for game in games]
        )
