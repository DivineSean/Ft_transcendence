
from channels.generic.websocket import WebsocketConsumer
from .models import Notifications
from Auth.models import Users   


class  Notification(WebsocketConsumer):
    def connect(self):
        self.user =   Users.objects.get(id = self.scope["user"].id) 
        self.room_group_name = f"notifications_{self.user.id}"
        
        
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

        self.sendUnreadNotifs() # hadi idea jdida dyali kanjrbha, y sendi existing notifs m3a ytconecta l notif socket

    def sendUnreadNotifs(self):
        unreadnotifs_ = Notifications.objects.filter(
            userId = self.user,
            isRead = False
        ).order_by("-timestamp")
        
        for notif in unreadnotifs_:
            self.send(text_data = json.dumps({
                "type" : "notif",
                "message" : notif.notifMessage,
                "sender" : None,
                "receiver" : self.user.id,
                "notifType" : notif.notifType,
                "timestamp" : notif.timestamp.strftime('%b %d, %H:%M')
            }))

    def disconnect(self, code): 
        async_to_sync(
            self.channel_name.group_discard)(
                self.room_group_name,
                self.channel_name
            )
    

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get("message", {})            
            messageType = text_data_json.get("type")
            if messageType != "notification":
                self.close()
                return
        
            notifObj = self.createNotif(message)
            async_to_sync(self.channel_layer.group_send)(
                f"notifications_{notif_obj.userId.id}",
                {
                    "type" : "sendNotif",
                    "message" : notifObj.notifMessage,
                    "sender": self.user.id,
                    "receiver": notifObj.userId.id,
                    "notifType" : notifObj.notifType,
                    "timestamp" : str(msg.timestamp.strftime('%b %d, %H:%M'))
                }
            )
        except Exception as e:
            print(f"chi haja mahiyach: {str(e)}", flush = True)
            self.close()

    def sendNotif(self, event):
        self.send(text_data = json.dumps({
            "type": "notif",
            "message": event["message"],
            "sender" : event["sender"],
            "receiver" : event["receiver"],
            "notifType" : event["notifType"],
            "timestamp" : event["timestamp"],
        }))

    def createNotif(self, notif): #expecting kolchi perfect
        return Notifications.objects.create(
            userId = Users.objects.get(id = message["userId"]),
            notifType = message["notifType"],
            notifMessage = message["notifMessage"],
        )
