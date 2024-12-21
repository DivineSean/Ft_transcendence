from django.urls import path
from . import views

urlpatterns = [
    path(
        "api/chat/conversations/",
        views.ChatConversation.as_view(),
    ),
    path(
        "chat/getMessages/",
        views.getMessages.as_view(),
    ),
    path(
        "chat/sendmessagetofriend/",
        views.SendMessageToFriend.as_view(),
    ),
]
