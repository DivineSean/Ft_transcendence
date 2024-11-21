
from channels.generic.websocket import WebsocketConsumer
from .models import Notifications
from Auth.models import Users   


class  Notification(WebsocketConsumer):
    def connect(self):
        self.user =   Users.objects.get(id = self.scope["user"].id) 
        notifications = Notifications.objects.all(userId = self.user)
        

    
    def disconnect(self, code): 
        pass
    