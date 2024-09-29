from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from .serializers import RegisterSerializer
from django.http import JsonResponse, HttpResponse
from .models import Users
import json

@api_view(['GET'])
def checkAuth(request):
	print('hello world', flush=True)
	token = request.COOKIES.get('accessToken')
	print(token, flush=True)
	if not token:
		print('token is not good', flush=True)
		return Response({'authenticated': False}, status=401)
	try:
		JWTAuthentication().get_validated_token(token)
		return Response({'authenticated': True})
	except Exception as e:
		return Response({'authenticated': False, 'error': str(e)}, status=401)


@api_view(['POST'])
def registerView(request):
	serializer = RegisterSerializer(data=request.data)
	serializer.is_valid(raise_exception=True)
	serializer.save()

	return Response(serializer.data)


class CustomTokenObtainPairView(TokenObtainPairView):
	def post(self, request, *args, **kwargs):
		userTokens = super().post(request, *args, **kwargs)
		refresh_token = userTokens.data.get('refresh')
		access_token = userTokens.data.get('access')

		response = HttpResponse(content_type='application/json')
		response.set_cookie('refreshToken', refresh_token, httponly=True, secure=True, samesite='Lax')
		response.set_cookie('accessToken', access_token, secure=True)
		data = {"access": access_token}
		dump = json.dumps(data)
		response.content = dump

		return response


class CustomTokenRefreshView(TokenRefreshView):
	def post(self, request, *args, **kwargs):
		refresh_token = request.COOKIES.get('refreshToken')
		if not refresh_token:
			raise exceptions.AuthenticationFailed('no refresh token found in cookie')
		
		data = request.data.copy()
		data['refresh'] = refresh_token
		request._full_data = data

		response = super().post(request, *args, **kwargs)
		if response.status_code == 200:
			access_token = response.data.get('access')
			refresh_token = response.data.get('refresh')

			response.set_cookie('accessToken', access_token, secure=True)
			response.set_cookie('refreshToken', refresh_token, httponly=True, secure=True, samesite='Lax')

		return response
		# request.data['refresh'] = refresh_token
		# return super().post(request, *args, **kwargs)

		# if not refresh_token:
		# 	return Response({'authenticated': False}, status=401)

def hello(request):
    return HttpResponse("Hello, world!")
