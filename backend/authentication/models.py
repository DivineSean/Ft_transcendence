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
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    username = models.CharField(max_length=255, null=True, blank=True)

    status = models.CharField(max_length=8, choices=Status.choices, default=Status.OFFLINE)
    isOnline = models.BooleanField(default=False)
    isTwoFa = models.BooleanField(default=False)
    about = models.TextField(blank=True)
    profile_image = models.ImageField(
        upload_to="profile_images/", blank=True, null=True
    )
    exp = models.PositiveBigIntegerField(default=0)
    blockedUsers = models.JSONField(default=callableDict, null=True, blank=True)

    last_update = models.DateTimeField(auto_now=True)

    # Friends  = models.ManyToManyField("User", blank = True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if self.exp > 45000:
            self.exp = 45000
        super().save(*args, **kwargs)

    @classmethod
    def get_levels(cls):
        if cls.exp >= 45000:
            return 10
        elif cls.exp >= 36000:
            return 9
        elif cls.exp >= 28000:
            return 8
        elif cls.exp >= 21000:
            return 7
        elif cls.exp >= 15000:
            return 6
        elif cls.exp >= 10000:
            return 5
        elif cls.exp >= 6000:
            return 4
        elif cls.exp >= 3000:
            return 3
        elif cls.exp >= 1000:
            return 2
        elif cls.exp >= 0:
            return 1




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
