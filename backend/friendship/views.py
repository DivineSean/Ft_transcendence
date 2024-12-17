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
from Auth.serializers import UserFriendSerializer


class SendFriendRequest(APIView):
	def post(self, request):
		# response = Response(status=200)
		userId = request.data.get("receiverID")
		if userId:
			try:

				receieverData = Users.objects.get(id=userId)
				if receieverData.email == request._user.email:
					return Response(
						"Error : Trying to send friend request to current account",
						status=400,
					)

			except:
				return Response("ID of Receiver not Valid", status=400)

			try:

				friendRequest = FriendshipRequest.objects.get(
					Q(fromUser=userId) | Q(toUser=request._user.id)
				)
				return Response({'status': '400', 'message': 'you cannot send the friend request to this user'})

			except FriendshipRequest.DoesNotExist:

				friendRequest, isCreated = FriendshipRequest.objects.get_or_create(
					fromUser=request._user,
					toUser=Users.objects.get(email=receieverData),
					accepted_at=None,
				)

		return Response({'status': '200', 'message': 'request sent successfully'})

class AcceptFriendRequest(APIView):
	def post(self, request):
		userId = request.data.get('userId')

		if userId:
			try:
				friendRequest = FriendshipRequest.objects.get(
					Q(fromUser=userId) | Q(toUser=request._user.id)
				)

				friendRequest.accept()

				newFriendShip = Friendship.friends.get_or_create(
					user1=friendRequest.fromUser,
					user2=friendRequest.toUser,
				)

				friendRequest.delete()

			except FriendshipRequest.DoesNotExist:
				return Response({'status': '404', 'message': 'this friend request does not exsits!'})

		return Response({'status': '200', 'message': 'the friend request accepted successfuly'})


class DeclineFriendRequest(APIView):
		def post(self, request):
			userId = request.data.get("friendRequestID")

			if userId:
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



@api_view(['POST'])
def cancelFriendRequest(request):
	print(request.data, flush=True)

	userId = request.data.get('userId')
	if userId:
		try:
			friendRequest = FriendshipRequest.objects.get(
				Q(fromUser=userId) | Q(toUser=userId)
			)
			if request._user == friendRequest.fromUser:
				friendRequest.delete()
		except:
			return Response({'status': '400', 'message': 'this request not found'})
			
	# print(friendRequest.fromUser, friendRequest.toUser, flush=True)
		# print('request has been deleted successfully', flush=True)
	return Response({'status': '200', 'message': 'the request canceled successfuly'})


@api_view(["GET"])
def getFriendsView(request, username=None):
		# print('username forandship hhh => ', username, flush=True)
		if username == None:
			# print('wa hada ana hhhh', flush=True)
			user = request._user
		else:
			# print('hada machi ana wellah ma ana', flush=True)
			user = Users.objects.filter(username=username).first()
		friends = Friendship.friends.getFriends(user)
		listOfFriends = {
			"friends": [{**UserFriendSerializer(friend).data} for friend in friends]
		}
		return Response(listOfFriends)

@api_view(["GET"])
def getFriendRequests(request):
		friendRequestList = FriendshipRequest.objects.filter(
				Q(toUser=request._user)
		).select_related("fromUser")
		
		data = [
			{
				**UserFriendSerializer(friend_request.fromUser).data,
				'requestId': str(friend_request.FriendshipRequestID),
			}
			for friend_request in friendRequestList
		]

		for friend_request in friendRequestList:
			print(friend_request.FriendshipRequestID, flush=True)
		print(data, flush=True)
		return Response(data)


@api_view(["POST"])
def areFriends(request):  # Expecting User2 (ID)
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


@api_view(["POST"])  # should be in consummers for realtime block
def blockUser(request):
		userId = request.data.get("userId")
		if userId == None:
				return Response("userId requiered", status=status.HTTP_401_UNAUTHORIZED)
		try:
				UUID(userId, version=4)
		except:
				return Response("Not a valid UUID", status=status.HTTP_400_BAD_REQUEST)
		if Users.objects.get(id=userId).email == request._user.email:
				return Response("SameUser", status=status.HTTP_400_BAD_REQUEST)

		request._user.blockedUsers["blockedUsers"].append(userId)
		request._user.save()

		Friendship.objects.filter(Q(user1=userId) | Q(user2=userId)).delete()

		return Response(str(request._user.blockedUsers), status=status.HTTP_201_CREATED)
