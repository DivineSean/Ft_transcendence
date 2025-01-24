from rest_framework.decorators import APIView
from rest_framework.response import Response
from .models import Notifications
from .serializers import NotifSerializer
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
import logging

logger = logging.getLogger("uvicorn.error")


class NotificationsUser(APIView):

    def get(self, request):

        try:
            oneDayAgo = timezone.now() - timedelta(days=1)
            oneMonthAgo = timezone.now() - timedelta(days=30)

            Notifications.objects.filter(
                Q(timestamp__lt=oneDayAgo, isRead=True)
                | Q(timestamp__lt=oneMonthAgo, isRead=False),
                userId=request._user.id,
            ).delete()

            userNotifications = Notifications.objects.filter(
                userId=request._user.id
            ).order_by("-timestamp")

            unreadCount = userNotifications.filter(isRead=False).count()

            serializer = NotifSerializer(
                userNotifications, many=True, context={"request": request}
            )

            responseData = {
                "notifications": serializer.data,
                "unreadCount": unreadCount,
            }

            return Response(responseData, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, notificationId=None):

        if notificationId:
            try:
                Notifications.objects.filter(
                    notificationId=notificationId,
                ).update(isRead=True)

            except Exception as e:
                logger.error(str(e))
                return Response({"error", str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "deleted successfully"}, status=status.HTTP_200_OK)
