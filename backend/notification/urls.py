from django.urls import path
from . import views

urlpatterns = [
	# path("notification/", views.CreateNotif.as_view(), name="notif"),
	path("api/notification/", views.NotificationsUser.as_view(), name="notif"),
	path("api/notification/<str:userId>/", views.NotificationsUser.as_view(), name="notif"),
]
