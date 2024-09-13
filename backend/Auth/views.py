from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import RegisterSerializer
from django.http import JsonResponse
from .models import Users


@api_view(['POST'])
def registerView(request):
	serializer = RegisterSerializer(data=request.data)
	serializer.is_valid(raise_exception=True)
	serializer.save()
	return Response(serializer.data)

# @api_view(['POST'])
# def loginView(request):
# 	email = request.data['email']
# 	password = request.data['password']

# 	user = Users.objects.filter(email=email).first()

class CustomTokenObtainPairView(TokenObtainPairView):
	def post(self, request, *args, **kwargs):
		response = super().post(request, *args, **kwargs)
		refresh_token = response.data.get('refresh')
		access_token = response.data.get('access')

		response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='Lax')
		return Response({'access': access_token, 'refresh': refresh_token})

class CustomTokenRefreshView(TokenRefreshView):
	def post(self, request, *args, **kwargs):
		refresh_token = request.COOKIES.get('refreshToken')
		request.data['refresh'] = refresh_token
		return super().post(request, *args, **kwargs)


def hello(request):
    return HttpResponse("Hello, world!")