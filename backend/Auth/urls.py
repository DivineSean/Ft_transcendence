from django.contrib import admin
from django.urls import path,include
from . import views
from . import Oauth2
urlpatterns = [

    path('', Oauth2.home),
    path('intra/',  Oauth2.home),  #change redirect URL
    path('logout/',   Oauth2.logout)    
    
]