from django.urls import path
from . import views

urlpatterns = [
    path('notification/', views.Notification.as_view(), name='notif'),    
]