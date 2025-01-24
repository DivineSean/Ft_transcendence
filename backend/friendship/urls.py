from django.urls import path
from . import views

urlpatterns = [
    path(
        "api/friendrequests/",
        views.getFriendRequests,
        name="getFr",
    ),
    path(
        "api/friendrequest/send/",
        views.SendFriendRequest.as_view(),
        name="send_friend_request",
    ),
    path(
        "api/friendrequest/accept/",
        views.AcceptFriendRequest.as_view(),
        name="Accept_friend_request",
    ),
    path(
        "api/friendrequest/decline/",
        views.DeclineFriendRequest.as_view(),
        name="Decline_friend_request",
    ),
    path(
        "api/friendrequest/cancel/",
        views.cancelFriendRequest,
        name="cancel_friend_request",
    ),
    path(
        "api/friends/",
        views.getFriendsView,
        name="getFriends",
    ),
    path(
        "api/friends/<str:username>/",
        views.getFriendsView,
        name="getFriends",
    ),
    path(
        "api/friend/block/",
        views.blockUser,
        name="blockUser",
    ),
    path(
        "api/friend/unfriend/",
        views.unfriend,
        name="unfriend",
    ),
    path("api/user/unblock/", views.unblockUser, name="unblockUser"),
    path("api/users/blocked/", views.getBlockedUsers, name="blocked users"),
]
