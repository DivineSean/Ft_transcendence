from django.urls import path
from . import views

urlpatterns = [
    path('friends/SendRequest/', views.SendFriendRequest.as_view(), name='send_friend_request'),
    path('friends/AcceptRequest/', views.AcceptFriendRequest.as_view(), name='Accept_friend_request'),
    path('friends/declineRequest/', views.DeclineFriendRequest.as_view(), name='Decline_friend_request'),
    
]