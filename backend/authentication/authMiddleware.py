from channels.auth import UserLazyObject
from channels.sessions import CookieMiddleware
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.deprecation import MiddlewareMixin
from channels.middleware import BaseMiddleware
from asgiref.sync import sync_to_async


class sAuthMiddleWare(MiddlewareMixin):
    def __init__(self, get_response):
        self.get_response = get_response
        self.UnlockedPaths = [
            "/api/google/login/",
            "/api/intra/login/",
            "/api/token/",

            "/api/callback/",
            "/api/token/refresh/",
            "/api/register/",
            "/api/auth/username/setup/",
            "/api/password-reset/send-code/",
            "/api/changepassword/",
			"/api/logout/",
			"/api/two-factor/resend/"
        ]

    def process_request(self, request):
        if hasattr(request, "path"):  # HTTP
            if request.path in self.UnlockedPaths:  # hadok no need nchecki 3lihom
                return None

            accessToken = request.COOKIES.get("accessToken")
            refreshToken = request.COOKIES.get("refreshToken")

            if not accessToken and not refreshToken:
                return JsonResponse(
                    {
                        "error": f"Invalid Tokens{request.path}",
                    },
                    status=401,
                )

            jwtObj = JWTAuthentication()

            try:
                validatedAccessToken = AccessToken(accessToken)
                user = jwtObj.get_user(validatedAccessToken)
                request._user = user
                # print("------------------>", request._user, flush=True)
                return None

            except:
                if not refreshToken:
                    return JsonResponse(
                        {
                            "error": "No Access No Refresh",
                        },
                        status=401,
                    )

                try:
                    refresh = RefreshToken(refreshToken)
                    new_access_token = str(refresh.access_token)
                    user = jwtObj.get_user(refresh)
                    request._user = user

                    request._new_access_token = new_access_token
                    return None  # ched had l access token 3ndk f dak response a jawad
                except:
                    return JsonResponse(
                        {
                            "error": "ta wahed ma khdam",
                        },
                        status=401,
                    )

        elif hasattr(request, "scope"):  # ASGI
            return None
        return None

    def process_response(self, request, response):
        if hasattr(request, "_new_access_token"):
            response.set_cookie(
                "accessToken",
                request._new_access_token,
                httponly=True,
                samesite="Strict",
            )
        return response  # Dima rj3 l9lawi


class JwtMiddlware(BaseMiddleware):
    def populate_scope(self, scope):
        if "user" not in scope:
            scope["user"] = UserLazyObject()

    async def get_user(self, scope):
        access_token = scope["cookies"].get("accessToken")
        refresh_token = scope["cookies"].get("refreshToken")

        user, _ = await self.authenticate(access_token, refresh_token)
        scope["user"] = user

    async def resolve_scope(self, scope):
        scope["user"]._wrapped = await self.get_user(scope)

    @sync_to_async
    def authenticate(self, access_token, refresh_token):

        jwt_auth = JWTAuthentication()
        try:
            validated_token = AccessToken(access_token)
            user = jwt_auth.get_user(validated_token)
            return user, None
        except:
            if refresh_token:
                try:
                    refresh = RefreshToken(refresh_token)
                    new_access_token = str(refresh.access_token)
                    user = jwt_auth.get_user(refresh)
                    return user, new_access_token
                except Exception:
                    return AnonymousUser, None
            return AnonymousUser, None

    async def __call__(self, scope, receive, send):
        scope = dict(scope)

        self.populate_scope(scope)
        await self.resolve_scope(scope)
        if scope["user"] is AnonymousUser:
            await send({"type": "websocket.accept"})
            await send(
                {
                    "type": "websocket.close",
                    "code": 4003,
                    "reason": "User in not authenticated",
                }
            )

            return
        return await super().__call__(scope, receive, send)


def JwtAuthMiddlwareStack(inner):
    return CookieMiddleware(JwtMiddlware(inner))
