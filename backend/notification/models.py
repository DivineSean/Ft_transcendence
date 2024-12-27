from django.db import models
import uuid
from Auth.models import Users
from datetime import datetime


class Notifications(models.Model):

    TYPES = [
        ("FR", "Friend Request"),
        ("IG", "Invite Game"),
        ("IT", "Invite Tournament"),
        ("ME", "Message"),
        ("CC", "Create Conversation"),
    ]
    notificationId = models.UUIDField(
        default=uuid.uuid4, unique=True, null=False, primary_key=True
    )
    userId = models.ForeignKey(
        Users, on_delete=models.CASCADE, related_name="receiver"
    )  # Receiver
    senderId = models.ForeignKey(
        Users, on_delete=models.CASCADE, related_name="sender"
    )  # Sender
    senderUsername = models.CharField(max_length=255, blank=True)
    notifType = models.CharField(max_length=2, choices=TYPES)
    notifMessage = models.CharField(max_length=255, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    isRead = models.BooleanField(default=False)
    targetId = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.notifMessage:
            self.notifMessage = self.get_default_message()
        super().save(*args, **kwargs)

    def updateRead(self, *args, **kwargs):
        self.isRead = False
        self.timestamp = datetime.now()
        super().save(*args, **kwargs)

    def get_default_message(self):
        return {
            "FR": "You Received a Friend Request from: ",
            "IG": "You've been invited to a game from: ",
            "IT": "You've been invited to a Tournament from: ",
            "ME": "You received a Message from: ",
            "CC": "Conversation created by: ",
        }.get(self.notifType, "finahowa l message d notif al 3yan")
