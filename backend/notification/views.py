from django.shortcuts import render
from rest_framework.decorators import APIView
from rest_framework.response import Response
from .models import Notifications
from Auth.models import Users
from rest_framework import status
class CreateNotif(APIView): 
    def post(self, request):
        try:
            user = Users.objects.get(id = request.data.get("receiverID")) 
        except:
            return Response({"Message" : "user Not found"}, status= status.HTTP_400_BAD_REQUEST)    
        notifType = request.data.get("notifType", None)
        
        if not notifType: 
            return Response({"Message" : "notifType Not found"}, status= status.HTTP_400_BAD_REQUEST)  
        obj = Notifications.objects.create(
            userId=  user.id,
            notifType = "FR",
            notifMessage = "notif1"
        )
        return Response("working", status=201)