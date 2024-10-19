from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
import random
import uuid
from django.utils import timezone

class CustomUserManager(BaseUserManager):
	def create_user(self, email, password=None, **extra_fields):
		if not email:
			raise ValueError('email is required field')
		email = self.normalize_email(email)
		user = self.model(email=email, **extra_fields)
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, email, password=None, **extra_fields):
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)
		return self.create_user(email, password, **extra_fields)


class Users(AbstractUser):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
	email = models.EmailField(max_length=255, unique=True)
	password = models.CharField(max_length=255, blank=True, null=True)
	first_name = models.CharField(max_length=255)
	last_name = models.CharField(max_length=255)
	username = models.CharField(max_length=255, null=True, blank=True)
	
	objects = CustomUserManager()

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = []


class TwoFactorCode(models.Model):
	user = models.ForeignKey('Users', on_delete=models.CASCADE)
	code = models.CharField(max_length=6)
	created_at = models.DateTimeField(auto_now_add=True)
	expires_at = models.DateTimeField()


	@classmethod
	def generate_code(cls, user):
		
		cls.objects.filter(user=user).delete()
		
		code = str(random.randint(100000, 999999))
		expires_at = timezone.now() + timezone.timedelta(minutes=5)
		return cls.objects.create(user=user, code=code, expires_at=expires_at)
	
	@classmethod
	def validate_code(cls, user, code):
		try:
			stored_code = cls.objects.get(
				user=user,
				code=code,
				expires_at__gt=timezone.now()
			)
			stored_code.delete()
			return True
		except cls.DoesNotExist:
			return False

# class Users(models.Model):
#     userID = models.CharField(max_length = 100,unique=True)
#     login = models.CharField(max_length = 100, unique= True)
#     email = models.EmailField(unique=True)
#     first_name = models.CharField(max_length=100)
#     last_name = models.CharField(max_length=100)
#     password = models.CharField(max_length=50)
#     def __str__(self):
#         return self.login