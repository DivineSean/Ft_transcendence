from django.shortcuts import render

from .models import FriendshipRequest, Friendship, ManageFriendship
from rest_framework.decorators import APIView
from rest_framework.response import Response
from Auth.models import Users
from django.db import IntegrityError
from rest_framework import status


class SendFriendRequest(APIView):
    def post(self, request):
        response = Response(status=200)

        try:
            receieverData = Users.objects.get(id=request.data.get("receiverID"))
            if receieverData.email == request._user.email:
                return Response(
                    "Error : Trying to send friend request to current account",
                    status=400,
                )
        except:
            return Response("ID of Receiver not Valid", status=400)

        friendRequest, isCreated = FriendshipRequest.objects.get_or_create(
            fromUser=request._user,
            toUser=Users.objects.get(email=receieverData),
            accepted_at=None,
        )

        friendRequestID = FriendshipRequest.objects.get(
            fromUser=request._user, toUser=Users.objects.get(email=receieverData)
        ).FriendshipRequestID
        resData = {
            "message": "FriendShip  Sent",
            "friendRequestID": str(friendRequestID),
            "User": user.email,
        }
        response.data = resData
        return response


class AcceptFriendRequest(APIView):
    def post(self, request):

        response = Response(status=200)

        try:
            friendRequest = FriendshipRequest.objects.get(
                FriendshipRequestID=request.data.get("friendRequestID")
            )
        except:
            return Response("Friend Request ID Valid", status=400)

        if request._user == friendRequest.toUser:
            friendRequest.accept()
            newFriendShip = Friendship.friends.get_or_create(
                user1=friendRequest.fromUser,
                user2=friendRequest.toUser,
            )
            return Response(
                {
                    "message": "FriendRequest accepted",
                    "FriendShipID": str(newFriendShip[0].friendshipID),
                }
            )
        return Response("Not Destined User", status=400)


class DeclineFriendRequest(APIView):
    def post(self, request):

        response = Response(status=200)
        try:
            friendRequest = FriendshipRequest.objects.get(
                FriendshipRequestID=request.data.get("friendRequestID")
            )
        except:
            return Response("Friend Request ID Valid", status=400)

        if request._user == friendRequest.toUser:
            friendRequest.reject()
            friendRequest.delete()

            return Response({"message": "FriendRequest Declined"})
        return Response("Not Destined User")
