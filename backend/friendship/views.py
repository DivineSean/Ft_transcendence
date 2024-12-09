from django.shortcuts import render

from .models import FriendshipRequest, Friendship, ManageFriendship
from rest_framework.decorators import APIView
from rest_framework.response import Response
from Auth.models import Users
from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view
from uuid import UUID
from django.db.models import Q
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
            "User": request._user.email,
        }
        response.data = resData
        return response


class AcceptFriendRequest(APIView):
    def post(self, request):

        try:
            friendRequest = FriendshipRequest.objects.get(
                FriendshipRequestID=request.data.get("friendRequestID")
            )
        except:
            return Response("friendRequestID Valid", status=400)

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


@api_view(["GET"])
def getFriendsView(request):
    listOfFriends = {}
    listOfFriends["Friends"] = []
    for element in Friendship.friends.getFriends(request._user):
        listOfFriends["Friends"].append(
            element.email
        )
    return Response(listOfFriends) 

@api_view(["POST"])
def areFriends(request): #Expecting User2 (ID)
    user2 = request.data.get("User2")
    if user2 == None:
        return Response("User2 requiered", status=status.HTTP_401_UNAUTHORIZED)
    try:
        UUID(user2, version=4)
    except:
        return Response("Not a valid UUID", status=status.HTTP_400_BAD_REQUEST)
    if Users.objects.get(id=user2).email == request._user.email:
        return Response("SameUser", status=status.HTTP_400_BAD_REQUEST)
        
    return Response(str(Friendship.friends.areFriends(request._user, user2)))


@api_view(["POST"]) #should be in consummers for realtime block
def blockUser(request):
    user2 = request.data.get("User2")
    if user2 == None:
        return Response("User2 requiered", status=status.HTTP_401_UNAUTHORIZED)
    try:
        UUID(user2, version=4)
    except:
        return Response("Not a valid UUID", status=status.HTTP_400_BAD_REQUEST)
    if Users.objects.get(id=user2).email == request._user.email:
        return Response("SameUser", status=status.HTTP_400_BAD_REQUEST)
    
    request._user.blockedUsers["blockedUsers"].append(user2)
    
    Friendship.objects.filter(Q(user1 = user2) | Q(user2 = user2)).delete()
    
    return Response(str(request._user.blockedUsers), status=status.HTTP_201_CREATED)