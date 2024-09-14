from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import RegisterSerializer
from django.http import JsonResponse, HttpResponse
from .models import Users


@api_view(['POST'])
def registerView(request):
	serializer = RegisterSerializer(data=request.data)
	serializer.is_valid(raise_exception=True)
	serializer.save()

	return Response(serializer.data)

import json

class CustomTokenObtainPairView(TokenObtainPairView):
	def post(self, request, *args, **kwargs):
		userTokens = super().post(request, *args, **kwargs)
		refresh_token = userTokens.data.get('refresh')
		access_token = userTokens.data.get('access')

		response = HttpResponse(content_type='application/json')
		response.set_cookie('refreshToken', refresh_token, samesite='Lax')
		data = {"access": access_token}
		dump = json.dumps(data)
		response.content = dump

		return response


class CustomTokenRefreshView(TokenRefreshView):
	def post(self, request, *args, **kwargs):
		refresh_token = request.COOKIES.get('refreshToken')
		request.data['refresh'] = refresh_token
		return super().post(request, *args, **kwargs)


def hello(request):
    return HttpResponse("Hello, world!")