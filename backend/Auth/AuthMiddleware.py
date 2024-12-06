from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.utils.deprecation import MiddlewareMixin

from channels.middleware import BaseMiddleware
from asgiref.sync import sync_to_async
from rest_framework import status
from channels.db import database_sync_to_async


class sAuthMiddleWare(MiddlewareMixin):
    def __init__(self, get_response):
        self.get_response = get_response
        self.UnlockedPaths = [
            "/api/google/",
            "/api/token/refresh/",
            "/api/token/",
            "/api/callback/",
            "/api/register/",
            "/api/setupusername/",
            "/api/intra/",
            "/api/user/",
            "/api/requestreset/",
            "/api/changepassword/",
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
                print("------------------>", request._user, flush=True)
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


class JWTAuthMiddleWare(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:
            if not scope.get("headers"):
                await send({"type": "websocket.close"})
                return

            cookies = await self.get_cookies(scope)
            if not cookies:
                await send({"type": "websocket.close"})
                return

            accessToken = cookies.get("accessToken")
            refreshToken = cookies.get("refreshToken")

            if not (accessToken and refreshToken):
                await send({"type": "websocket.close"})
                return

            try:
                user, new_access_token = await self.authenticate(
                    accessToken, refreshToken
                )
                if not user:
                    await send({"type": "websocket.close"})
                    return

                scope["user"] = user
                if new_access_token:
                    scope["new_access_token"] = new_access_token

                return await super().__call__(scope, receive, send)

            except:

                await send({"type": "websocket.close"})
                return

        except:
            await send({"type": "websocket.close"})
            return

    async def get_cookies(self, scope):
        try:
            headers = dict(scope["headers"])
            if b"cookie" in headers:
                cookie_header = headers[b"cookie"].decode("utf-8")
                return self.parse_cookies(cookie_header)
        except Exception as e:
            print("dfsfdsfdsfdfdsfds ", str(e), flush=True)
        return {}

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
                except Exception as e:
                    print(f"fdsfdsfdsffdsfdsfdsfsfsd {str(e)}", flush=True)
                    return None, None
            return None, None

        return None, None

    @staticmethod
    def parse_cookies(cookie_header):
        cookies = {}
        try:
            if not cookie_header:
                return cookies

            for cookie in cookie_header.split("; "):
                if "=" in cookie:
                    name, value = cookie.split("=", 1)
                    cookies[name.strip()] = value.strip()
        except Exception as e:
            print("dslfdskfldskfdlkdflkdsldfks ", str(e), flush=True)
        return cookies
