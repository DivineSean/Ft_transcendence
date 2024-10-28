from django.db import models
import random
import string
from Auth.models import Users





def generateToken(length):
    token = "".join(random.choice(string.ascii_letters) for _ in range(length)) 


class Room(models.Model):
    token = models.CharField(max_length=255, unique = True)
    users = models.ManyToManyField(Users)
    createdAt = models.DateTimeField(auto_now_add=True) 
    def save(self, *args, **kwargs):
        if not self.token: 
            self.token = generateToken(15)
        return super(Room, self).save(*args, **kwargs)

class Message(models.Model):   
    roomName = models.ForeignKey(Room, on_delete = models.CASCADE)
    sender = models.ForeignKey(Users, on_delete = models.CASCADE, related_name= "sender_user")
    message = models.TextField(blank = True)
    timestamp = models.DateTimeField(auto_now_add=True) 
    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return self.sender.username
    

