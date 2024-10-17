from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from .serializers import RegisterSerializer
from django.http import JsonResponse, HttpResponse
from .models import Users, TwoFactorCode
from django.contrib.auth.views import PasswordResetView
import json
from django.core.mail import get_connection, EmailMessage
from rest_framework import status
from django.core.cache import cache
from django.http import HttpResponseRedirect
import os
from django.conf import settings


# class CustomPasswordResetView(PasswordResetView):
# 	html_email_template_name = 'registration/password_reset_email.html'
# 	subject_template_name = 'registration/password_reset_subject.txt'

@api_view(['GET'])
def checkAuth(request):
	token = request.COOKIES.get('accessToken')
	if not token:
		return Response({'authenticated': False}, status=401)
	try:
		JWTAuthentication().get_validated_token(token)
		# we should check if 2FA is enabled (I m assuming that 2FA is enabled by default)
		# I should do a 2FA sending mail here 

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
	# En gros, khsek checki daba wlit kan verifyi wach 2fa_code katpassih f post, ila la rah kan returni status code 400, khsek checkiha fl front w dir UI dyal 2fa
	#You can test f postman , jrb t sendi post request l api/token bla 2fa_code, ghaytsifet lik email fih 2fa code, 3awd sift request post l nefs l enpoint wzid 3tih 2fa_code li 3titlk fl email
	def generate_2fa_code(self, user):
		return TwoFactorCode.generate_code(user)

	def send_2fa_code(self, user_email, code):
		with get_connection(
			host=os.environ.get("EMAIL_HOST"), 
			port=os.environ.get("EMAIL_PORT"),
			username=os.environ.get("EMAIL_HOST_USER"), 
			password=os.environ.get("EMAIL_HOST_PASSWORD"),  #hada machi password dyal email dyalek, khasek t enabli 2fa f gmail w ki3tiwek wahed l app passowrd, googli sinon use my env
			use_tls=True
		) as connection:  
			subject = "2FA CODE"
			email_from = settings.EMAIL_HOST_USER  
			recipient_list = [user_email]  
			message = f"Your 2FA CODE : {code}"  
			EmailMessage(subject, message, email_from, recipient_list, connection=connection).send()

	def post(self, request, *args, **kwargs):
		try:
			email = request.data.get('email')
			user = Users.objects.get(email=email)
		except Users.DoesNotExist:
			return Response({'message': 'User not found'}, status=401)
		except Users.MultipleObjectsReturned:
			return Response({'message': 'Multiple users found with the same email'}, status=401)

		if user and not user.password:
			return Response({'message': 'This email cannot be logged in with a password'}, status=401)

		
		response = super().post(request, *args, **kwargs)
		
		if response.status_code == 200:
			
			submitted_2fa_code = request.data.get('2fa_code') #hna kanakhed l code li kaypassih l user f 2FA, swblih UI dyalo w dir request l nefs l endpoint
			if not submitted_2fa_code:
				two_factor_code = self.generate_2fa_code(user)
				self.send_2fa_code(user.email, two_factor_code.code)
				return Response({'message': '2FA code sent', 'requires_2fa': True}, status=200)
			
			# Hna kan verifyi wach l code li passiti liya fl post method hwa nit li 3titek fl mail
			if not TwoFactorCode.validate_code(user, submitted_2fa_code):
				print("here", flush = True)
				return Response({'message': 'Invalid 2FA code'}, status=400)
			
			refresh_token = response.data.get('refresh')
			access_token = response.data.get('access')

			http_response = HttpResponse(content_type='application/json')
			http_response.set_cookie('refreshToken', refresh_token, httponly=True, secure=True, samesite='Lax')
			http_response.set_cookie('accessToken', access_token, secure=True)
			data = {"message": "ok"}
			http_response.content = json.dumps(data)
			
			return http_response

		return response

@api_view(["POST"]) # its ok ila passiti liya l body khawi, ghir khliha POST 7it rah loggout hada 
def logout(request):
	refresh_token = request.COOKIES.get('refreshToken')
	if refresh_token:
		token = RefreshToken(refresh_token)
		token.blacklist()
	response = HttpResponseRedirect(os.environ.get("REDIRECT_URL"))
	response = Response({"message": "Logged Out"}, status=status.HTTP_200_OK)
	response.delete_cookie("accessToken")
	response.delete_cookie("refreshToken")
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

			response.set_cookie('accessToken', access_token, httponly=True, secure=True, samesite='Lax')
			response.set_cookie('refreshToken', refresh_token, httponly=True, secure=True, samesite='Lax')

		return response
		# request.data['refresh'] = refresh_token
		# return super().post(request, *args, **kwargs)

		# if not refresh_token:
		# 	return Response({'authenticated': False}, status=401)

@api_view(["POST"])
def logout(request):
    try:
        refresh_token = request.COOKIES.get('refreshToken')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()  # Invalidate the token server-side

        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie("accessToken")
        response.delete_cookie("refreshToken")

        # Check if redirect is needed (e.g., for web browsers)
        if request.query_params.get('redirect'):
            redirect_url = request.query_params.get('redirect_url') or settings.LOGIN_URL
            return HttpResponseRedirect(redirect_url)

        return response

    except Exception as e:
        return Response({"detail": f"An error occurred during logout: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)