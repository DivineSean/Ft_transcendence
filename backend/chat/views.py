from django.shortcuts import render
from rest_framework.decorators import APIView
from Auth.AuthMiddleware import HttpJWTAuthMiddleWare
from rest_framework.response import Response
from rest_framework import status

#from django.http import HttpResponse
from chat.models import Conversation
from Auth.models import Users
def chat_room(request, room_name):
    return render(request, 'room.html',{'room_name' : room_name})



class SendMessage(APIView):
    def post(self,request, *args, **kwargs):
        
        try:
            user, accessToken = HttpJWTAuthMiddleWare().parseCookies(request)
            senderMail = user.email
        except:     
            return Response("Invalid tokens")
        
        try:
            ReceiverData = Users.objects.get(id = request.data.get("receiverID"))
        except:
            return Response("ID of receiver not valid", status=status.HTTP_400_BAD_REQUEST)
        newConversation = Conversation.objects.create(
            Sender = Users.objects.get(email = senderMail),
            Receiver = ReceiverData 
        )   
        
        response = Response(status=status.HTTP_200_OK)
        if accessToken:
            response.set_cookie("accessToken", accessToken,httponly=True, secure=True, samesite='Lax')
        
        resData = {'ConversationID': str(newConversation.ConversationId), "sender" : str(user.email)}
        response.data = resData
        
        return response
    
    