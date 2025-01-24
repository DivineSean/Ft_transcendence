from django.db import models
from authentication.models import User
from django.db.models import Q
import uuid


class FriendshipRequest(models.Model):
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    fromUser = models.ForeignKey(
        User, related_name="fromUser", on_delete=models.CASCADE
    )
    toUser = models.ForeignKey(User, related_name="toUser", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            "fromUser",
            "toUser",
        )


class ManageFriendship(models.Manager):
    def getFriends(self, user):
        friendships = self.filter(Q(user1=user) | Q(user2=user))
        friendsIds = []
        for f in friendships:
            if f.user1 == user:
                friendsIds.append(f.user2.id)
            else:
                friendsIds.append(f.user1.id)

        return User.objects.filter(id__in=friendsIds)


class Friendship(models.Model):
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    user1 = models.ForeignKey(User, related_name="f1", on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name="f2", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user1", "user2")

    objects = models.Manager()
    friends = ManageFriendship()
