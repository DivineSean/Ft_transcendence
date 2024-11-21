from django.db import models
import uuid
from Auth.models import Users
class Notifications(models.Model):
    
    FR = "FR" 
    IG = "IG"
    IT = "IT"
    ME = "MR"
    notifType = (
        (FR , "FriendRequest"), 
        (IG , "InviteGame"),
        (IT , "InviteTournament"),
        (ME , "MessageReceived"),
    )
    notificationId = models.UUIDField(default= uuid.uuid4, unique=True, null= False, primary_key=True)  
    userId = models.ForeignKey(Users, on_delete=models.CASCADE) #Receiver
    notifType = models.CharField(max_length=255, choices=notifType,)
    notifMessage = models.CharField(max_length = 255, null= True)
    timestamp = models.DateTimeField(auto_now_add=True)
    isRead  = models.BooleanField(default=False)
    def fillMessage(self, type): 
        if type == "FR":
            self.notifMessage = "You Received a Friend Request"
        elif type == "IG":
            self.notifMessage = "You've been invited to a game"
        elif type == "IT":
            self.notifMessage = "You've been invited to a Tournament"
        elif type == "ME":
            self.notifMessage = "You received a Message"
        self.save()
