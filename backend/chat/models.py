from django.db import models
from authentication.models import User
import uuid


class Conversation(models.Model):
    ConversationId = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    Sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_conversations"
    )
    Receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_conversations"
    )
    isBlocked = models.BooleanField(default=False)


class Message(models.Model):
    MessageId = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    ConversationName = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="ConversationName"
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sender_user"
    )
    message = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    isRead = models.BooleanField(default=False)
    isSent = models.BooleanField(default=True)
    metadata = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.sender.username
