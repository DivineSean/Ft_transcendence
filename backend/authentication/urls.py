from django.urls import path
from . import views
from . import oauth

urlpatterns = [
    path(
        "api/auth/check-authenticated/",
        views.checkUserIsAuthenticated,
        name="check user is authenticated",
    ),
    path("api/intra/login/", oauth.login42, name="42login"),
    path("api/google/login/", oauth.loginGoogle, name="loginGoogle"),
    path("api/callback/", oauth.callback, name="42login"),
    path("api/two-factor/resend/", views.resend2FACode, name="resend_2fa_code"),
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
        "api/password-reset/send-code/",
        views.RequestPasswordChange.as_view(),
        name="send2FACode",
    ),
    path(
        "api/password-reset/confirm/",
        views.CheckPasswordChange.as_view(),
        name="resetPassword",
    ),
    path(
        "api/logout/",
        views.logout,
    ),
    path("api/auth/username/setup/", views.setUpUsername, name="firstLastName"),
    path("api/profile/", views.Profile.as_view(), name="profile"),
    path("api/profile/<str:username>/", views.Profile.as_view(), name="profile"),
    path("api/profile/update/", views.Profile.as_view(), name="updateProfie"),
    path("api/users/search/", views.search_users, name="search_users"),
    path(
        "api/user/achievements/",
        views.get_user_achievements,
        name="get_user_achievements",
    ),
    path(
        "api/user/achievements/<str:username>/",
        views.get_user_achievements,
        name="get_user_achievements",
    ),
]
