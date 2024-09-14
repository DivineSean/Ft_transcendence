from django.contrib import admin
from django.urls import path,include
from . import views
from . import Oauth2
from . import G_Oauth2
from .views import registerView, CustomTokenObtainPairView, CustomTokenRefreshView
import re
import   os

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

match = re.search(r'/(?P<pattern>[^/]+)$', str(os.environ.get("REDIRECT_URL")))
RedirectURL = match.group('pattern') + '/'

urlpatterns = [
    path('api/42login/', Oauth2.login42, name='42login'),
    path('api/Glogin/', Oauth2.loginGoogle, name='loginGoogle'),
  
    path(RedirectURL, Oauth2.home, name='hello'),
    path('api/users/', Oauth2.show_users, name='users'),

		path('api/register/', registerView, name='register'),
		# path('api/login', loginView, name='login'),
		path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
]
