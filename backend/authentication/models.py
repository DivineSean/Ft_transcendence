from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
import random
import uuid
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("email is required field")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


def callableDict():
    listofblockedUsers = {}
    listofblockedUsers = []
    return listofblockedUsers


class User(AbstractUser):
    class Status(models.TextChoices):
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"
        IN_GAME = "in-game", "In Game"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255, blank=True, null=True)
    first_name = models.CharField(max_length=12, blank=True, null=True)
    last_name = models.CharField(max_length=12, blank=True, null=True)
    username = models.CharField(max_length=12, null=True, blank=True)

    status = models.CharField(
        max_length=8, choices=Status.choices, default=Status.OFFLINE
    )
    connect_count = models.PositiveBigIntegerField(default=0)
    isTwoFa = models.BooleanField(default=True)
    about = models.TextField(blank=True)
    profile_image = models.ImageField(
        upload_to="profile_images/", blank=True, null=True
    )
    exp = models.PositiveBigIntegerField(default=0)
    blockedUsers = models.JSONField(default=callableDict, null=True, blank=True)

    exp_history = models.JSONField(default=list)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.exp_history:
            creation_date = timezone.now().strftime("%b %d")
            self.exp_history = [{"date": creation_date, "exp": 0}]

    def update_status(self, new_status):
        from games.models import Player, GameRoom

        self.refresh_from_db()

        if new_status == self.Status.ONLINE:
            if self.status == self.Status.OFFLINE:
                player = (
                    Player.objects.filter(
                        user=self,
                        game_room__status__in=[
                            GameRoom.Status.WAITING,
                            GameRoom.Status.ONGOING,
                            GameRoom.Status.PAUSED,
                        ],
                    )
                    .select_related("game_room")
                    .first()
                )
                if player and player.ready is True:
                    self.status = self.Status.IN_GAME
                else:
                    self.status = new_status
            elif self.status == self.Status.IN_GAME:
                self.status = new_status
        else:
            self.status = new_status

        self.save()

    def increase_exp(self, added_exp):
        self.refresh_from_db()
        creation_date = timezone.now().strftime("%b %d")

        if self.exp_history:
            last_exp = self.exp_history[-1]["exp"]
        else:
            last_exp = 0

        new_exp = last_exp + added_exp

        self.exp = new_exp
        self.exp_history.append({"date": creation_date, "exp": new_exp})
        self.save()

    def total_exp(self):
        total_exp = self.exp_history[-1]["exp"] if self.exp_history else 0
        return total_exp

    last_update = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def get_levels(self):
        if self.exp >= 45000:
            return 10
        elif self.exp >= 36000:
            return 9
        elif self.exp >= 28000:
            return 8
        elif self.exp >= 21000:
            return 7
        elif self.exp >= 15000:
            return 6
        elif self.exp >= 10000:
            return 5
        elif self.exp >= 6000:
            return 4
        elif self.exp >= 3000:
            return 3
        elif self.exp >= 1000:
            return 2
        elif self.exp >= 0:
            return 1

    def get_percentage(self):
        levels = {
            1: (0, 1000),
            2: (1000, 3000),
            3: (3000, 6000),
            4: (6000, 10000),
            5: (10000, 15000),
            6: (15000, 21000),
            7: (21000, 28000),
            8: (28000, 36000),
            9: (36000, 45000),
            10: (45000, float("inf")),
        }

        lower_bound, upper_bound = levels[self.get_levels()]

        if upper_bound == float("inf"):
            return 100

        return ((self.exp - lower_bound) / (upper_bound - lower_bound)) * 100


class TwoFactorCode(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    codeType = models.CharField(max_length=8)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    @classmethod
    def generate_code(cls, user, codeType):

        cls.objects.filter(user=user).delete()

        code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timezone.timedelta(minutes=5)
        return cls.objects.create(
            user=user, code=code, codeType=codeType, expires_at=expires_at
        )

    @classmethod
    def validate_code(cls, user, code, codeType):
        try:
            stored_code = cls.objects.get(
                user=user, code=code, codeType=codeType, expires_at__gt=timezone.now()
            )
            stored_code.delete()
            return True
        except cls.DoesNotExist:
            return False
