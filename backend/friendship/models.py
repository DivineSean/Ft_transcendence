from django.db import models
from Auth.models import Users
from django.utils import timezone
from django.db.models import Q
import uuid


class FriendshipRequest(models.Model):
    # For now I'm not removing friendRequest after being accepted or deleted, just updating the timestamp (not quite sure about best practise)
    """had l model bach tstori friend request 9bel mat accepta wla declina"""

    FriendshipRequestID = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    fromUser = models.ForeignKey(
        Users, related_name="fromUser", on_delete=models.CASCADE
    )  # t9der t accessi via user_object.friendship_request_sent.all()
    toUser = models.ForeignKey(
        Users, related_name="toUser", on_delete=models.CASCADE
    )  # t9der t accessi via user_object.friendship_request_received.all()
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, default=None, blank=True)
    rejected_at = models.DateTimeField(null=True, default=None, blank=True)

    class Meta:
        unique_together = (
            "fromUser",
            "toUser",
        )  # bach maykounouch 3ndna duplicates friendships dyal 2 same users

    def accept(self):

        self.accepted_at = timezone.now()
        self.save()

    def reject(self):
        self.rejected_at = timezone.now()
        self.save()


class ManageFriendship(models.Manager):
    """Hada L manager dyalna, ghadi ndir view ki returni lik friends f Json , calliha fl front"""

    def areFriends(self, user1, user2):
        return self.filter(
            Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)
        ).exists()

    def getFriends(self, user):
        friendships = self.filter(Q(user1=user) | Q(user2=user))
        friendsIds = []
        for f in friendships:
            if f.user1 == user:
                friendsIds.append(f.user2.id)
            else:
                friendsIds.append(f.user1.id)

        return Users.objects.filter(id__in=friendsIds)


class Friendship(models.Model):
    """Had l model bach kan3rfo l friend requests li t confirmaw"""

    friendshipID = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    user1 = models.ForeignKey(Users, related_name="f1", on_delete=models.CASCADE)
    user2 = models.ForeignKey(Users, related_name="f2", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user1", "user2")

    objects = models.Manager()
    friends = ManageFriendship()
