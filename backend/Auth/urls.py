from django.contrib import admin
from django.urls import path,include
from . import views
from . import Oauth2
from . import G_Oauth2
from django.contrib.auth import views as auth_views
import re
import   os

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

match = re.search(r'/(?P<pattern>[^/]+)$', str(os.environ.get("REDIRECT_URL")))
RedirectURL = match.group('pattern') + '/'

urlpatterns = [
    path('42login/', Oauth2.login42, name='42login'),
    path('Glogin/', Oauth2.loginGoogle, name='loginGoogle'),
  
    path(RedirectURL, Oauth2.home, name='hello'),
    path('users/', Oauth2.show_users, name='users'),

		# path('login', loginView, name='login'),
		path('check_auth/', views.checkAuth, name='check_auth'),
		path('register/', views.registerView, name='register'),
		path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),

		#reset password
		path('reset_password', views.CustomPasswordResetView.as_view(), name='reset_password'),
		path('password_reset_done', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
		path('reset/<uidb64>/<token>', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
		path('reset_password_complete', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
