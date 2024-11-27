from django.db import models
import uuid
from Auth.models import Users


class Notifications(models.Model):

    TYPES = [
        ("FR", "Friend Request"),
        ("IG", "Invite Game"),
        ("IT", "Invite Tournament"),
        ("ME", "Message"),
    ]
    notificationId = models.UUIDField(
        default=uuid.uuid4, unique=True, null=False, primary_key=True
    )
    userId = models.ForeignKey(Users, on_delete=models.CASCADE)  # Receiver
    notifType = models.CharField(max_length=2, choices=TYPES)
    notifMessage = models.CharField(max_length=255, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    isRead = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.message:
            self.message = self.get_default_message()
        super().save(*args, **kwargs)

    def get_default_message(self):
        return {
            "FR": "You Received a Friend Request",
            "IG": "You've been invited to a game",
            "IT": "You've been invited to a Tournament",
            "ME": "You received a Message",
        }.get(self.notifType, "finahowa l message d notif al 3yan")
