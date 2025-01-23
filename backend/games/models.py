from django.db import models
from django.db.models.base import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from authentication.models import User as User
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
    bracket = models.ForeignKey(
        "tournament.Bracket", on_delete=models.CASCADE, null=True, blank=True
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.WAITING
    )
    state = models.JSONField(default=dict)
    turn = models.PositiveSmallIntegerField(default=1)
    started_at = models.BigIntegerField(default=0)
    paused_at = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class Player(models.Model):
    class Result(models.TextChoices):
        WIN = "win", "Win"
        LOSS = "loss", "Loss"
        DRAW = "draw", "Draw"
        DISCONNECTED = "Disconnected", "Disconnected"

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game_room = models.ForeignKey(GameRoom, on_delete=models.CASCADE)
    rating_gain = models.PositiveSmallIntegerField()
    rating_loss = models.PositiveSmallIntegerField()
    role = models.PositiveSmallIntegerField()
    ready = models.BooleanField(default=False)
    score = models.PositiveIntegerField(default=0)
    timeouts = models.PositiveSmallIntegerField(default=3)
    result = models.CharField(
        max_length=12, choices=Result.choices, blank=True, null=True
    )
    should_skip_next = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class PlayerRating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.PROTECT)
    rating = models.PositiveIntegerField(default=951)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def handle_rating(cls, user, game, player):
        try:
            last_rating = (
                cls.objects.filter(
                    user=user,
                    game=game,
                )
                .order_by("-created_at")
                .first()
            )
        except cls.DoesNotExist:
            return

        new_rating = last_rating.rating
        if player["result"] == "win":
            new_rating += player["rating_gain"]
        else:
            if new_rating < player["rating_loss"]:
                new_rating = 0
            else:
                new_rating -= player["rating_loss"]

        try:
            cls.objects.create(
                user=user,
                game=game,
                rating=new_rating,
            )
        except Exception as e:
            return


class Achievement(models.Model):
    name = models.CharField(max_length=100, unique=True)
    game = models.ForeignKey(
        Game, on_delete=models.PROTECT, related_name="achievements"
    )
    description = models.TextField(blank=True)

    LEVELS = {
        "bronze": 1,
        "silver": 3,
        "gold": 10,
        "diamond": 25,
        "platinium": 50,
        "titanium": 100,
    }

    @classmethod
    def get_levels(cls):
        return cls.LEVELS

    @classmethod
    def get_threshold_for_level(cls, level):
        return cls.LEVELS.get(level)

    @classmethod
    def next_level(cls, current_level):
        levels = list(cls.LEVELS.keys())
        try:
            current_index = levels.index(current_level)
            return (
                levels[current_index + 1] if current_index +
                1 < len(levels) else None
            )
        except ValueError:
            return None

    def __str__(self):
        return f"{self.name} ({self.game.name})"


class PlayerAchievement(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="achievements"
    )
    game = models.ForeignKey(Game, on_delete=models.PROTECT)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    level = models.CharField(max_length=20)
    progress = models.PositiveIntegerField(default=0)
    threshold = models.PositiveIntegerField()
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "game", "achievement", "level")

    def upgrade_level(self, increment):
        if self.progress < self.threshold:
            self.progress += increment
            self.save()
            return

        next_level = self.achievement.next_level(self.level)
        if next_level:
            self.earned_at = self.earned_at or now()

            PlayerAchievement.objects.create(
                user=self.user,
                game=self.game,
                achievement=self.achievement,
                level=next_level,
                progress=(self.progress - self.threshold) + increment,
                threshold=self.achievement.get_threshold_for_level(next_level),
            )
        else:
            self.progress = self.threshold
            self.earned_at = self.earned_at or now()

        self.save()

    @classmethod
    def add_progress(cls, user, game, achievement_name, increment=1):
        achievement = Achievement.objects.get(name=achievement_name, game=game)
        current_level = (
            cls.objects.filter(user=user, game=game, achievement=achievement)
            .order_by("-threshold")
            .first()
        )

        if not current_level:
            cls.objects.create(
                user=user,
                game=game,
                achievement=achievement,
                level="bronze",
                progress=increment,
                threshold=achievement.get_threshold_for_level("bronze"),
            )
        else:
            current_level.upgrade_level(increment)


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
