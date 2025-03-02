from django.urls import path
from . import views

urlpatterns = [
    path("api/notification/", views.NotificationsUser.as_view(), name="notif"),
    path(
        "api/notification/<str:notificationId>/",
        views.NotificationsUser.as_view(),
        name="notif",
    ),
]
