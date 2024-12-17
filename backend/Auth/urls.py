from django.contrib import admin
from django.urls import path, include
from . import views
from . import Oauth2
from django.contrib.auth import views as auth_views
import re
import os

urlpatterns = [
    path("api/intra/", Oauth2.login42, name="42login"),
    path("api/callback/", Oauth2.callback, name="42login"),
    path("api/google/", Oauth2.loginGoogle, name="loginGoogle"),
    path("api/users/", Oauth2.show_users, name="users"),
    path("api/resent2fa/", views.resend2FACode, name="resend_2fa_code"),
    path("api/register/", views.registerView, name="register"),
    path(
        "api/token/",
        views.CustomTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "api/token/refresh/",
        views.CustomTokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
        "api/requestreset/", views.RequestPasswordChange.as_view(), name="send2FACode"
    ),
    path(
        "api/changepassword/", views.CheckPasswordChange.as_view(), name="resetPassword"
    ),
    path(
        "api/logout/",
        views.logout,
    ),
    path("api/user/", views.getUser, name="firstLastName"),
    path("api/setupusername/", views.setUpUsername, name="firstLastName"),
    path("api/configure2FA", views.alter2FA, name="2fa"),
    path("api/profile/<str:username>/", views.Profile.as_view(), name="profile"),
    path("api/profile/update/", views.Profile.as_view(), name="updateProfie"),
]
