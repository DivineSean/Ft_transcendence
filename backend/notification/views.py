from django.shortcuts import render
from rest_framework.decorators import APIView
from rest_framework.response import Response
from .models import Notifications
from .serializers import NotifSerializer
from authentication.models import User
from rest_framework import status
from django.utils import timezone
from datetime import timedelta


class NotificationsUser(APIView):

	def get(self, request):

		try:
			userNotifications = Notifications.objects.filter(
				userId=request._user.id
			).order_by("-timestamp")

			oneDayAgo = timezone.now() - timedelta(days=1)
			oneMonthAgo = timezone.now() - timedelta(days=30)

			userNotifications.filter(timestamp__lt=oneDayAgo, isRead=True).delete()
			userNotifications.filter(timestamp__lt=oneMonthAgo, isRead=False).delete()

			unreadCount = userNotifications.filter(isRead=False).count()

			serializer = NotifSerializer(
				userNotifications, many=True, context={"request": request}
			)

			responseData = {
				"notifications": serializer.data,
				"unreadCount": unreadCount,
			}

			return Response(
				responseData,
				status=status.HTTP_200_OK
			)

		except Exception as e:
			print(e, flush=True)
			return Response(
				{"error": str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)

	def delete(self, request, notificationId=None):

		if notificationId:
			try:
				notifications = Notifications.objects.filter(
					notificationId=notificationId,
				).update(isRead=True)
				print("notifications", notifications, flush=True)

			except Exception as e:
				return Response(
					{"error", str(e)},
					status=status.HTTP_400_BAD_REQUEST
				)

		return Response(
			{"message": "deleted successfully"},
			status=status.HTTP_200_OK
		)
