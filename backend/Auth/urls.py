from django.contrib import admin
from django.urls import path,include
from . import views
from . import Oauth2
from django.contrib.auth import views as auth_views
import re
import   os

urlpatterns = [
    path('api/intra/', Oauth2.login42, name='42login'),
    path('api/callback/', Oauth2.callback, name='42login'),
    path('api/google/', Oauth2.loginGoogle, name='loginGoogle'),
  
    path('api/users/', Oauth2.show_users, name='users'),
	
	path('api/check_auth/', views.checkAuth, name='check_auth'),
	path('api/register/', views.registerView, name='register'),
	path('api/token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),

	
    path('logout/', views.logout,),
		#reset password
		# path('api/reset_password/', views.CustomPasswordResetView.as_view(), name='password_reset'),
		# path('api/password_reset_done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
		# path('api/reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
		# path('api/reset_password_complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
