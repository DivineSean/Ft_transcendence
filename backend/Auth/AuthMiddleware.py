from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from asgiref.sync import sync_to_async
from rest_framework import status


class HttpJWTAuthMiddleWare(BaseMiddleware):
	def __init__(self):
		pass

	def parseCookies(self,request,  *args, **kwargs):
			
		accessToken = request.COOKIES.get("accessToken")
		refreshToken = request.COOKIES.get("refreshToken")
		if not accessToken and not refreshToken: 
				return None, None
		jwtObj = JWTAuthentication()

		try:          
			validatedAccessToken = AccessToken(accessToken) 
			# print(validatedAccessToken, flush=True)
			user = jwtObj.get_user(validatedAccessToken)
			return user, None
		except:
			try:
				refresh = RefreshToken(refreshToken)
				newAccessToken = str(refresh.access_token)
				
				user = jwtObj.get_user(refresh)
				
				# print(user, flush=True)
				return user, newAccessToken
			except:
				return None, None
        

class JWTAuthMiddleWare(BaseMiddleware):
    
    async def __call__(self, scope, receive, send):

        headers = dict(scope['headers'])
        if b'cookie':
            cookie_header = headers[b'cookie'].decode('utf-8')
            cookies = self.parse_cookies(cookie_header)
            accessToken = cookies.get("accessToken")
            refreshToken = cookies.get("refreshToken")

            # INFO: the authenticate function returns the user and a new access token
            # if the old one expires, for now it's only ignored
            # a better way is to tell the frontend to update it's cookie with the new token
            # still dont know how :(
            user, new_access_token = await self.authenticate(accessToken, refreshToken)
            if user:
                scope["user"] = user
            else:
                await send({"type": "websocket.close"})
                return

        return await super().__call__(scope, receive, send)

    @sync_to_async
    def authenticate(self, access_token, refresh_token):
        jwt_auth = JWTAuthentication()

        try:
            validated_token = AccessToken(access_token)
            user = jwt_auth.get_user(validated_token)
            return user, None
        except (InvalidToken, TokenError):
            # If access token is expired, attempt to refresh
            if refresh_token:
                try:
                    print(refresh_token, flush=True)
                    refresh = RefreshToken(refresh_token)
                    new_access_token = str(refresh.access_token)
                    user = jwt_auth.get_user(refresh)
                    return user, new_access_token
                except (InvalidToken, TokenError):
                    return None, None
            return None, None

    @staticmethod
    def parse_cookies(cookie_header):
        cookies = {}
        for cookie in cookie_header.split("; "):
            name, value = cookie.split("=", 1)
            cookies[name] = value
        return cookies
