from django.urls import path, re_path

from .consumers import Notification

notification_urlpatterns = [   
    path('ws/notification/<str:room_name>/', Notification.as_asgi()),
]