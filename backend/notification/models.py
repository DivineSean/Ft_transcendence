from django.db import models
import uuid
from authentication.models import User
from datetime import datetime


class Notifications(models.Model):

		TYPES = [
				("FR", "Friend Request"),
				("AF", "Accept Friend Request"),
				("IG", "Invite Game"),
				("IT", "Invite Tournament"),
				("ME", "Message"),
				("CC", "Create Conversation"),
		]
		notificationId = models.UUIDField(
				default=uuid.uuid4, unique=True, null=False, primary_key=True
		)
		userId = models.ForeignKey(
				User, on_delete=models.CASCADE, related_name="receiver"
		)  # Receiver
		senderId = models.ForeignKey(
				User, on_delete=models.CASCADE, related_name="sender"
		)  # Sender
		senderUsername = models.CharField(max_length=255, blank=True)
		notifType = models.CharField(max_length=2, choices=TYPES)
		notifMessage = models.CharField(max_length=255, null=True)
		timestamp = models.DateTimeField(auto_now_add=True)
		isRead = models.BooleanField(default=False)
		targetId = models.CharField(max_length=255, blank=True, null=True)
		game = models.CharField(max_length=255, blank=True, null=True)

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
						"FR": "You have received a friend request from: ",
						"IG": "You've been invited to a game by: ",
						"IT": "You've been invited to a tournament by: ",
						"ME": "You have received a message from: ",
						"CC": "Conversation created by: ",
						"AF": "Your friend request has been accepted by: ",
				}.get(self.notifType, "finahowa l message d notif al 3yan")
