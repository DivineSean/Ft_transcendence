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
from chat.views import Conversation


class SendFriendRequest(APIView):
	def post(self, request):
		# response = Response(status=200)
		userId = request.data.get("userId")
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
			if userId == request._user.id:
				return Response({'error': 'invalid user id'}, status=status.HTTP_400_BAD_REQUEST)

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
			userId = request.data.get("userId")

			if userId:
				if userId == request._user.id:
					return Response({'error': 'invalid user id'}, status=status.HTTP_400_BAD_REQUEST)

				try:
					friendRequest = FriendshipRequest.objects.get(
						Q(fromUser=userId) | Q(toUser=request._user.id)
					)

					friendRequest.reject()
					friendRequest.delete()
				except:
					return Response({'status': '400', 'message': 'this friend request does not exsits!'})

			print('declined userId', userId, flush=True)
			return Response({'status': '200', 'message': 'friend request rejected successfully'})

@api_view(['POST'])
def unfriend(request):
	userId = request.data.get('userId')

	if userId:
		if userId == request._user.id:
			return Response({'error', 'ivalid user id'}, status=status.HTTP_400_BAD_REQUEST)
		
		print('userId unfriend', userId, flush=True)
		try:
			friendship = Friendship.objects.get(
				Q(user1=request._user.id, user2=userId) | Q(user1=userId, user2=request._user.id)
			)

			friendship.delete()

		except Friendship.DoesNotExist:
			return Response({'status': '404', 'message': 'this friendship does not exsits!'})

	return Response({'message': 'the friendship deleted successfully'})


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

		try:
			conversation = Conversation.objects.get(
				Q(Sender=userId, Receiver=request._user.id) |
				Q(Sender=request._user.id, Receiver=userId)
			)
			conversation.isBlocked = True
			conversation.save()
		except:
			pass
		request._user.blockedUsers.append(userId)
		request._user.save()

		Friendship.objects.filter(
			Q(user1=userId) | Q(user2=userId)
		).delete()

		return Response(str(request._user.blockedUsers), status=status.HTTP_201_CREATED)


@api_view(['POST'])
def unblockUser(request):
	userId = request.data.get('userId')

	if userId:
		if userId == request._user.id:
			return Response({'error': 'ivalid user id'}, status=status.HTTP_400_BAD_REQUEST)
		
		blockedUsers = request._user.blockedUsers or []

		if userId not in blockedUsers:
			return Response({'status': '404', 'message': 'the user provied not in blocked list'})
		
		try:
			conversation = Conversation.objects.get(
				Q(Sender=userId, Receiver=request._user.id) |
				Q(Sender=request._user.id, Receiver=userId)
			)
			conversation.isBlocked = False
			conversation.save()
		except:
			pass

		blockedUsers.remove(userId)
		request._user.blockedUsers = blockedUsers
		request._user.save()

	else:
		return Response({'error': 'no user id provided'}, status=status.HTTP_400_BAD_REQUEST)

	return Response({'status': '200', 'message': 'ublocked successfully'})