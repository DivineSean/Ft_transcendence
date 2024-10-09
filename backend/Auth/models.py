from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

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
	email = models.EmailField(max_length=255, unique=True)
	password = models.CharField(max_length=255, blank=True, null=True)
	first_name = models.CharField(max_length=255)
	last_name = models.CharField(max_length=255)
	username = models.CharField(max_length=255, null=True, blank=True)
	
	objects = CustomUserManager()

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = []

# class Users(models.Model):
#     userID = models.CharField(max_length = 100,unique=True)
#     login = models.CharField(max_length = 100, unique= True)
#     email = models.EmailField(unique=True)
#     first_name = models.CharField(max_length=100)
#     last_name = models.CharField(max_length=100)
#     password = models.CharField(max_length=50)
#     def __str__(self):
#         return self.login