from django.urls import path
from . import views

urlpatterns = [
		path(
				"api/chat/conversations/",
				views.ChatConversation.as_view(),
		),
		path(
				"api/chat/messages/<str:convID>/<int:offset>/",
				views.getMessages.as_view(),
		),
		path(
				"api/chat/conversations/search/",
				views.search_conversations,
		),
]
