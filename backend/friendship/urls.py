from django.urls import path
from . import views

urlpatterns = [
    path('friends/request/<uuid:user_id>/', views.SendFriendRequest.as_view(), name='send_friend_request'),
    path('friends/handle-request/<uuid:request_id>/', views.HandleFriendRequest.as_view(), name='handle_friend_request'),
    # path('friends/requests/', views.FriendList.as_view(), name='friend_requests'),
    path('friends/', views.FriendListView.as_view(), name='friends_list'),
    path('friends/remove/<uuid:user_id>/', views.RemoveFriend.as_view(), name='remove_friend'),
    #path('friends/status/<uuid:user_id>/', views.FriendshipStatusView.as_view(), name='friendship_status'), mn b3d
]