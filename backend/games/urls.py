from django.urls import path, include
from . import views

urlpatterns = [
    path("api/matches/", views.getOnlineMatches, name="online matches"),
]
