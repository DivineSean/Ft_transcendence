from django.db import models

class IntraUser(models.Model):
    intraID = models.IntegerField(unique=True)
    login = models.CharField(max_length = 100, unique= True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    password = models.CharField(max_length=50)
    def __str__(self):
        return self.login