from django.urls import path
from . import views

urlpatterns = [
    path('SendMessage/', views.SendMessage.as_view(),),
		path('chat/getMessages/', views.getMessages.as_view(),),
		path('chat/sendmessagetofriend/', views.SendMessageToFriend.as_view(),),
    path('chat/conversations/', views.GetConversationRooms.as_view(),),
]   