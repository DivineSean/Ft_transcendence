from django.shortcuts import render

from .models import FriendshipRequest, Friendship, ManageFriendship
from rest_framework.decorators import APIView
from rest_framework.response import Response
from Auth.models import Users
from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view
from channels.layers import get_channel_layer
from uuid import UUID
from django.db.models import Q
from Auth.serializers import UserFriendSerializer
from chat.views import Conversation
from asgiref.sync import async_to_sync
from notification.models import Notifications


class SendFriendRequest(APIView):

	def post(self, request): # handled all errors
		userId = request.data.get("userId")
		if userId: # check if the userId provided in the request body
			try:

				# check if the userId is the same of the current user id
				if userId == str(request._user.id):
					return Response(
						{"error": "trying to send friend request to current account"},
						status=status.HTTP_400_BAD_REQUEST
					)
				receieverData = Users.objects.get(id=userId)

			except Exception as e: # error
				return Response(
					{"error": str(e)},
					status=status.HTTP_400_BAD_REQUEST
				)

			try:

				friendRequest = FriendshipRequest.objects.get(
					fromUser=userId, toUser=request._user.id
				)
				return Response(
					{"error": "you cannot send the friend request to this user"},
					status=status.HTTP_400_BAD_REQUEST
				)

			# if there is no friendship does not exist in database
			except FriendshipRequest.DoesNotExist:

				friendRequest, isCreated = FriendshipRequest.objects.get_or_create(
					fromUser=request._user,
					toUser=receieverData,
					accepted_at=None,
				)
				# check if the friend request already sent return BAD REQUEST
				if isCreated:
					user = Users.objects.get(id=userId)
					notification, isNew = Notifications.objects.get_or_create(
						notifType="FR",
						userId=user,
						senderId=request._user,
						senderUsername=request._user.username,
						targetId=str(request._user.id),
					)

					# check if the notif is not created before or already read
					if not isNew and notification.isRead:
						notification.updateRead()
						channel_layer = get_channel_layer()
						group_name = f"notifications_{userId}"
						async_to_sync(channel_layer.group_send)(
							group_name,
							{
								"type": "send_friend_request",
								"sender": str(request._user.id),
							},
						)
					return Response(
						{"message": f"request sent successfully to {receieverData.username}"},
						status=status.HTTP_200_OK
					)
					
				else: # if the friendship already exist in the database
					return Response(
						{"error":"the friend request is already sent"},
						status=status.HTTP_400_BAD_REQUEST
					)
			
			except Exception as e: # error
				Response(
					{"error": str(e)},
					status=status.HTTP_400_BAD_REQUEST
				)

		else: # if no userId provided in the request body
			return Response(
				{"error":"no user id provided"},
				status=status.HTTP_400_BAD_REQUEST
			)


class AcceptFriendRequest(APIView):

	def post(self, request):

		userId = request.data.get("userId")
		if userId: # check if the userId provided in the request body

			# check if the provided userId is same of the current user id
			if userId == str(request._user.id):
				return Response(
					{"error": "invalid user id"},
					status=status.HTTP_400_BAD_REQUEST
				)

			try:
				friendRequest = FriendshipRequest.objects.get(
					fromUser=userId, toUser=request._user.id
				)

				newFriendShip = Friendship.friends.get_or_create(
					user1=friendRequest.fromUser,
					user2=friendRequest.toUser,
				)

				friendRequest.delete()
				
			except Exception as e:
				return Response(
					{"error": str(e)},
					status=status.HTTP_400_BAD_REQUEST
				)

			return Response(
				{"message": "the friend request accepted successfuly"},
				status=status.HTTP_200_OK
			)

		else: # if no userId provided in the request body

			return Response(
				{"error":"no user id provided"},
				status=status.HTTP_400_BAD_REQUEST
			)


class DeclineFriendRequest(APIView):

	def post(self, request):

		userId = request.data.get("userId")
		if userId: # check if the userId provided in the request body

			if userId == str(request._user.id):
				return Response(
					{"error": "invalid user id"},
					status=status.HTTP_400_BAD_REQUEST
				)
			
			try:
				friendRequest = FriendshipRequest.objects.get(
					fromUser=userId, toUser=request._user.id
				)

				friendRequest.delete()

				return Response(
					{"message": "friend request rejected successfully"},
					status=status.HTTP_200_OK
				)

			except Exception as e:
				return Response(
					{"error": str(e)},
					status=status.HTTP_400_BAD_REQUEST
				)

		else: # if no userId provided in the request body
			return Response(
				{"error": "no user id provided"},
				status=status.HTTP_400_BAD_REQUEST
			)


@api_view(["POST"])
def unfriend(request):

	userId = request.data.get("userId")
	if userId:

		if userId == str(request._user.id):
			return Response(
				{"error", "ivalid user id"},
				status=status.HTTP_400_BAD_REQUEST
			)
			
		try:
			friendship = Friendship.objects.get(
				Q(user1=request._user.id, user2=userId)
				| Q(user1=userId, user2=request._user.id)
			)

			friendship.delete()

			return Response(
				{"message": "the friendship deleted successfully"},
				status=status.HTTP_200_OK
			)

		except Exception as e:
			return Response(
				{"error": str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)

	else: # if no userId provided in the request body
		return Response(
			{"error": "no user id provided"},
			status=status.HTTP_400_BAD_REQUEST
		)



@api_view(["POST"])
def cancelFriendRequest(request):

	userId = request.data.get("userId")
	if userId:

		if userId == str(request._user.id):
			return Response(
				{"error", "ivalid user id"},
				status=status.HTTP_400_BAD_REQUEST
			)

		try:
			friendRequest = FriendshipRequest.objects.get(
				fromUser=request._user.id,
				toUser=userId
			)

			friendRequest.delete()

			return Response(
				{"message": "the request canceled successfuly"},
				status=status.HTTP_200_OK
			)

		except Exception as e:
			return Response(
				{"error": str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)
			
	else:
		return Response(
			{"error": "no user id provided"},
			status=status.HTTP_400_BAD_REQUEST
		)


@api_view(["GET"])
def getFriendsView(request, username=None):

	if username == None:
		user = request._user
	else:
		user = Users.objects.filter(username=username).first()

	if not user:
		return Response(
			{'error': 'no user with the username provided'},
			status=status.HTTP_400_BAD_REQUEST
		)

	try:

		friends = Friendship.friends.getFriends(user)
		listOfFriends = {
			"friends": [{**UserFriendSerializer(friend).data} for friend in friends]
		}
		return Response(listOfFriends, status=status.HTTP_200_OK)

	except Exception as e:
		return Response(
			{"error": str(e)},
			status=status.HTTP_400_BAD_REQUEST
		)


@api_view(["GET"])
def getFriendRequests(request):

	friendRequestList = FriendshipRequest.objects.filter(
		Q(toUser=request._user)
	).select_related("fromUser")

	try:
		data = [
			{
				**UserFriendSerializer(friend_request.fromUser).data,
				"requestId": str(friend_request.FriendshipRequestID),
			}
			for friend_request in friendRequestList
		]

		return Response(data, status=status.HTTP_200_OK)

	except Exception as e:
		return Response(
			{"error": str(e)},
			status=status.HTTP_400_BAD_REQUEST
		)


@api_view(["POST"])
def blockUser(request):

	userId = request.data.get("userId")
	if userId:

		if userId == str(request._user.id):
			return Response(
				{"error", "ivalid user id"},
				status=status.HTTP_400_BAD_REQUEST
			)

		try:

			conversation = Conversation.objects.get(
				Q(Sender=userId, Receiver=request._user.id)
				| Q(Sender=request._user.id, Receiver=userId)
			)

			conversation.isBlocked = True
			conversation.save()
		
		except Conversation.DoesNotExist:
			pass

		except Exception as e:
			return Response(
				{"error": str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		isUserAlreadyBlocked = userId in request._user.blockedUsers or False
		
		if not isUserAlreadyBlocked:

			request._user.blockedUsers.append(userId)
			request._user.save()
			Friendship.objects.filter(Q(user1=userId) | Q(user2=userId)).delete()
		
		else:
			return Response(
				{"error": "the user is already blocked"},
				status=status.HTTP_400_BAD_REQUEST
			)
		return Response(
			{"message": "the user is blocked successfully"},
			status=status.HTTP_200_OK
		)

	else:
		return Response(
			{"error": "no user id provided"},
			status=status.HTTP_400_BAD_REQUEST
		)


@api_view(["POST"])
def unblockUser(request):

	userId = request.data.get("userId")
	if userId:

		if userId == str(request._user.id):
			return Response(
				{"error": "ivalid user id"},
				status=status.HTTP_400_BAD_REQUEST
			)

		blockedUsers = request._user.blockedUsers or []

		if userId not in blockedUsers:
			return Response(
				{"message": "the user provied not in blocked list"},
				status=status.HTTP_400_BAD_REQUEST
			)

		try:
			conversation = Conversation.objects.get(
				Q(Sender=userId, Receiver=request._user.id)
				| Q(Sender=request._user.id, Receiver=userId)
			)
			conversation.isBlocked = False
			conversation.save()

		except Conversation.DoesNotExist:
			pass

		except Exception as e:
			return Response(
				{"error": str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)

		blockedUsers.remove(userId)
		request._user.blockedUsers = blockedUsers
		request._user.save()

		return Response(
			{"message": "user ublocked successfully"},
			status=status.HTTP_200_OK
		)

	else:
		return Response(
			{"error": "no user id provided"},
			status=status.HTTP_400_BAD_REQUEST
		)



@api_view(["GET"])
def getBlockedUsers(request):

	try:
		blockedUsersId = request._user.blockedUsers or []

		blockedUsers = Users.objects.filter(id__in=blockedUsersId)

		serializer = UserFriendSerializer(blockedUsers, many=True)

		return Response(
			{"blockedUsers": serializer.data},
			status=status.HTTP_200_OK
		)

	except Exception as e:
		return Response(
			{"error", e},
			status=status.HTTP_400_BAD_REQUEST
		)