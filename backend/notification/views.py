from django.shortcuts import render
from rest_framework.decorators import APIView
from rest_framework.response import Response
from .models import Notifications
from .serializers import NotifSerializer
from Auth.models import Users
from rest_framework import status
from django.utils import timezone
from datetime import timedelta


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

			oneDayAgo = timezone.now() - timedelta(days=1)
			oneMonthAgo = timezone.now() - timedelta(days=30)
			userNotifications.filter(timestamp__lt=oneDayAgo, isRead=True).delete()
			userNotifications.filter(timestamp__lt=oneMonthAgo, isRead=False).delete()
			unreadCount = userNotifications.filter(isRead=False).count()
			serializer = NotifSerializer(userNotifications, many=True, context={'request': request})
			responseData = {
				'notifications': serializer.data,
				'unreadCount': unreadCount
			}
			return Response(responseData)

		except Notifications.DoesNotExist:
			return Response({'error': 'the notif does not exists'}, status=status.HTTP_400_BAD_REQUEST)

		except Exception as ex:
			print(ex, flush=True)
			return Response({'error': str(ex)}, status=status.HTTP_400_BAD_REQUEST)
	
	def delete(self, request, notificationId=None):
		print('notificationId', notificationId, flush=True)
		if notificationId:
			try:
				notifications = Notifications.objects.filter(
					notificationId=notificationId,
				).update(isRead=True)
				print('notifications', notifications, flush=True)
			except Exception as e:
				return Response({'error', str(e)}, status=status.HTTP_400_BAD_REQUEST)
		return Response({"message": 'deleted successfully'})
		