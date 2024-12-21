from django.shortcuts import render
from rest_framework.decorators import APIView
from rest_framework.response import Response
from .models import Notifications
from .serializers import NotifSerializer
from Auth.models import Users
from rest_framework import status


class CreateNotif(APIView):
	def post(self, request):
		try:
			user = Users.objects.get(id=request.data.get("receiverID"))
		except:
			return Response(
				{"Message": "user Not found"}, status=status.HTTP_400_BAD_REQUEST
			)
		notifType = request.data.get("notifType", None)

		if not notifType:
			return Response(
				{"Message": "notifType Not found"}, status=status.HTTP_400_BAD_REQUEST
			)
		obj = Notifications.objects.create(
			userId=user.id, notifType="FR", notifMessage="notif1"
		)
		return Response("working", status=201)

class NotificationsUser(APIView):
	def get(self, request):
		try:
			userNotifications = Notifications.objects.filter(userId=request._user.id).order_by('-timestamp')
			serializer = NotifSerializer(userNotifications, many=True)
			return Response(serializer.data)
		except Notifications.DoesNotExist:
			return Response({'error': 'the notif does not exists'}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as ex:
			return Response({'error': str(ex)}, status=status.HTTP_400_BAD_REQUEST)
	
	def delete(self, request, userId=None):
		print('userId', userId, flush=True)
		if userId:
			try:
				notifications = Notifications.objects.filter(
					userId=request._user.id,
					senderId=userId,
				)
				print('notifications', notifications, flush=True)
			except Exception as e:
				return Response({'error', str(e)}, status=status.HTTP_400_BAD_REQUEST)
		return Response({"message": 'deleted successfully'})
		