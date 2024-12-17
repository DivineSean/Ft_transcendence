from django.urls import path, re_path

from .consumers import ChatAndNotificationConsumer

notification_urlpatterns = [
    path("ws/notification/<str:room_name>/", ChatAndNotificationConsumer.as_asgi()),
]
