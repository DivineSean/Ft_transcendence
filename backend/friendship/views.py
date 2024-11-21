from django.shortcuts import render

from .models import FriendshipRequest, Friendship, ManageFriendship
from rest_framework.decorators import APIView
from Auth.AuthMiddleware import HttpJWTAuthMiddleWare
from rest_framework.response import Response
from Auth.models import Users
from django.db import IntegrityError
from rest_framework import status

class SendFriendRequest(APIView):
    def post(self, request):
        response = Response(status=200)
        try:
            user, accessToken = HttpJWTAuthMiddleWare().parseCookies(request)
            senderMail = user.email
            
        except:
            return Response("Invalid Tokens", status = 400)
       
        if accessToken:     
            response.set_cookie("accessToken", accessToken, httponly=True, secure=True, samesite='Lax')
        try:
            receieverData = Users.objects.get(id = request.data.get("receiverID"))
            if receieverData.email == senderMail:
                return Response("Error : Trying to send friend request to current account", status=400)
        except:
            return Response("ID of Receiver not Valid", status=400)
        
        
        friendRequest, isCreated  = FriendshipRequest.objects.get_or_create(
            fromUser = Users.objects.get(email = senderMail), 
            toUser = Users.objects.get(email = receieverData),
            accepted_at = None
        )
        
        friendRequestID = FriendshipRequest.objects.get(fromUser = Users.objects.get(email = senderMail), toUser = Users.objects.get(email = receieverData)).FriendshipRequestID        
        resData = {"message": "FriendShip  Sent", 
                    "friendRequestID" : str(friendRequestID), 
                    "User" : user.email}
        response.data = resData
        return response
        
    
class AcceptFriendRequest(APIView):
    def post(self, request):
        
        response = Response(status=200)
        try:
            user, accessToken = HttpJWTAuthMiddleWare().parseCookies(request)
            senderMail = user.email
        except:
            return Response("Invalid Tokens", status = 400)
        try:
            friendRequest  = FriendshipRequest.objects.get(FriendshipRequestID = request.data.get("friendRequestID"))
        except:
            return Response("Friend Request ID Valid", status=400)
        if accessToken:     
            response.set_cookie("accessToken", accessToken, httponly=True, secure=True, samesite='Lax')
        if Users.objects.get(email = senderMail) == friendRequest.toUser: 
            friendRequest.accept()
            friendRequest
            newFriendShip = Friendship.friends.get_or_create(
                user1 =  friendRequest.fromUser,
                user2 =  friendRequest.toUser,
            )
            return Response({"message" : "FriendRequest accepted", "FriendShipID" : str(newFriendShip[0].friendshipID)})
        return Response("Not Destined User", status=400)

           
class DeclineFriendRequest(APIView):
    def post(self, request):
        
        response = Response(status=200)
        try:
            user, accessToken = HttpJWTAuthMiddleWare().parseCookies(request)
            senderMail = user.email
        except:
            return Response("Invalid Tokens", status = 400)
        try:
            friendRequest  = FriendshipRequest.objects.get(FriendshipRequestID = request.data.get("friendRequestID"))
        except:
            return Response("Friend Request ID Valid", status=400)
        if accessToken:     
            response.set_cookie("accessToken", accessToken, httponly=True, secure=True, samesite='Lax')
        if Users.objects.get(email = senderMail) == friendRequest.toUser: 
            friendRequest.reject()
            friendRequest.delete()
           
            return Response({"message" : "FriendRequest Declined"})
        return Response("Not Destined User")



