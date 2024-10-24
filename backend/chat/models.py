from django.db import models
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

class ChatMessage(models.Model):
    roomName = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    sender = models.ForeignKey('Auth.Users', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True) 
    
