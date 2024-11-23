
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from asgiref.sync import sync_to_async
from django.utils.deprecation import MiddlewareMixin


class sAuthMiddleWare(MiddlewareMixin):
    def __init__(self, get_response):
        self.get_response = get_response
        self.UnlockedPaths  = [
            "/api/register/",
            "api/token/refresh/",

        ]
    def process_request(self, request):
        print("flskfdlskds " , request.path, flush=True)
        if request.path not in self.UnlockedPaths: 
            accessToken = request.COOKIES.get("accessToken", 0)
            

        
    # def process_response(self, request, response):
    #     # This method is called after the view
    #     # You can modify the response here
    #     return response

