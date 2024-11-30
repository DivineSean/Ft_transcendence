from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import RegisterSerializer, PasswordUpdateSerializer, UserSerializer
from django.core.mail import get_connection, EmailMessage
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.views import PasswordResetView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from django.forms.models import model_to_dict
from rest_framework import exceptions, status
from rest_framework.response import Response
from .models import Users, TwoFactorCode
from rest_framework.views import APIView
from django.shortcuts import render
from django.core.cache import cache
from django.conf import settings
import json
from django.utils import timezone
import os
import uuid
import jwt

from rest_framework_simplejwt.tokens import RefreshToken

# @api_view(['GET'])

# def checkAuth(request): #Should be removed
# 	token = request.COOKIES.get('accessToken')
# 	if not token:
# 		return Response({'authenticated': False}, status=401)
# 	try:
# 		JWTAuthentication().get_validated_token(token)

# 		return Response({'authenticated': True})
# 	except Exception as e:
# 		return Response({'authenticated': False, 'error': str(e)}, status=401)


@api_view(["POST"])
def registerView(request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save()

		return Response(serializer.data)


# resend2FACode is a post method to resend the 2FA code
# -> check the user with the email if it's in the database, otherwise return error
# -> then generate a new 2FA code and send it the user's email and return a response
@api_view(["POST"])
def resend2FACode(request):
		json_data = json.loads(request.body)
		try:
				user_id = json_data.get("id")
				uuid.UUID(user_id, version=4)
		except ValueError:
				return Response({"error": "invalid id"}, status=400)

		try:
				user = Users.objects.get(id=user_id)
		except Users.DoesNotExist:
				return Response({"error": "User not  found"}, status=401)
		except Users.MultipleObjectsReturned:
				return Response(
						{"error": "Multiple users found with the same email"}, status=401
				)

		code_type = json_data.get("type")
		twofaOjt = CustomTokenObtainPairView()
		if code_type == "reset":
				two_factor_code = twofaOjt.generate_2fa_code(user, "password")
		else:
				two_factor_code = twofaOjt.generate_2fa_code(user, "twoFa")
		twofaOjt.send_2fa_code(user.email, two_factor_code.code)
		return Response({"message": "2FA code sent", "required_2fa": True}, status=200)


# if the 2fa_code is not set in the body of the request the POST function behave as follow:
# -> make sure that the user who send the request is not an Oauth user,
#    if it's then return an error (because he can logged in using email and password)
# -> logged in the user if the user logged in successfully, then generate the 2FA code and send it the user email


# otherwise the POST behave as follow:
# -> check the email for the user if user found then, verify the 2fa_code is valid if it's set the cookies
#    and navigate to the home page.
class CustomTokenObtainPairView(TokenObtainPairView):

		def generate_2fa_code(self, user, codeType):
				return TwoFactorCode.generate_code(user, codeType)

		def send_2fa_code(self, user_email, code):
				with get_connection(
						host=os.environ.get("EMAIL_HOST"),
						port=os.environ.get("EMAIL_PORT"),
						username=os.environ.get("EMAIL_HOST_USER"),
						password=os.environ.get("EMAIL_HOST_PASSWORD"),
						use_tls=True,
				) as connection:
						subject = "2FA CODE"
						email_from = settings.EMAIL_HOST_USER
						recipient_list = [user_email]
						message = f"Your 2FA CODE : {code}"
						EmailMessage(
								subject, message, email_from, recipient_list, connection=connection
						).send()

		def checkUsername(self, user, user_id):
				user_username = user.username
				if not user_username:

						http_response = HttpResponse(content_type="application/json")
						data = {"message": "ok", "username": user_username, "uid": str(user_id)}
						dump = json.dumps(data)
						http_response.content = dump
						return http_response

				else:
						user.isOnline = True
						user.save()
						refresh_token = RefreshToken.for_user(user)
						access_token = str(refresh_token.access_token)

						http_response = HttpResponse(content_type="application/json")
						http_response.set_cookie(
								"refreshToken",
								refresh_token,
								httponly=True,
								secure=True,
								samesite="Lax",
						)
						http_response.set_cookie(
								"accessToken", access_token, httponly=True, secure=True, samesite="Lax"
						)
						data = {
								"message": "logged in successfully!",
						}
						dump = json.dumps(data)
						http_response.content = dump
						return http_response

		def post(self, request, *args, **kwargs):

				json_data = json.loads(request.body)
				submitted_2fa_code = json_data.get("2fa_code")

				if not submitted_2fa_code:  # here is the login part

						try:
								email = json_data.get("email")
								user = Users.objects.get(email=email)
						except Users.DoesNotExist:
								return Response({"error": "User not found"}, status=401)
						except Users.MultipleObjectsReturned:
								return Response(
										{"error": "Multiple users found with the same email"}, status=401
								)

						if user and not user.password:
								return Response({"error": "invalid email or password"}, status=401)

						user_id = user.id
						userTokens = super().post(request, *args, **kwargs)
						if userTokens.status_code == 200:
								if user.isTwoFa:
										print("is true am3alam", flush=True)
										two_factor_code = self.generate_2fa_code(user, "twoFa")
										self.send_2fa_code(user.email, two_factor_code.code)
										return Response(
												{
														"message": "2FA code sent",
														"uid": user_id,
														"requires_2fa": True,
												},
												status=200,
										)
								else:
										print("is false am3alam", flush=True)
										# return Response({'message': '2FA code sent', 'uid': user_id, 'requires_2fa': False}, status=200)
										return self.checkUsername(user, user_id)

				else:  # here endpoint for 2FA authorization

						try:
								user_id = json_data.get("id")
								uuid.UUID(user_id, version=4)
						except ValueError:
								return Response({"error": "invalid id"}, status=400)

						try:
								user = Users.objects.get(id=user_id)
						except Users.DoesNotExist:
								return Response({"error": "User not found"}, status=401)
						except Users.MultipleObjectsReturned:
								return Response(
										{"error": "Multiple users found with the same id"}, status=401
								)

						if not TwoFactorCode.validate_code(user, submitted_2fa_code, "twoFa"):
								print("here", flush=True)
								return Response({"error": "Invalid 2FA code"}, status=400)

						return self.checkUsername(user, user_id)


# this method to refresh tokens
class CustomTokenRefreshView(TokenRefreshView):
		def post(self, request, *args, **kwargs):
				refresh_token = request.COOKIES.get("refreshToken")
				if not refresh_token:
						raise exceptions.AuthenticationFailed("no refresh token found in cookie")

				data = request.data.copy()
				data["refresh"] = refresh_token
				request._full_data = data

				response = super().post(request, *args, **kwargs)
				if response.status_code == 200:
						access_token = response.data.get("access")
						refresh_token = response.data.get("refresh")

						response.set_cookie(
								"accessToken", access_token, httponly=True, secure=True, samesite="Lax"
						)
						response.set_cookie(
								"refreshToken",
								refresh_token,
								httponly=True,
								secure=True,
								samesite="Lax",
						)

				return response


@api_view(["POST"])
def logout(request):

		refresh_token = request.COOKIES.get("refreshToken")
		# response = HttpResponseRedirect(os.environ.get("REDIRECT_URL"))
		response = Response({"message": "Logged Out"}, status=status.HTTP_200_OK)

		if refresh_token:
				token = RefreshToken(refresh_token)

				response.delete_cookie("accessToken")
				response.delete_cookie("refreshToken")
				jwtObj = JWTAuthentication()
				try:
						user = jwtObj.get_user(token)
						user.isOnline = False
						user.last_login = timezone.now()
						user.save()
						token.blacklist()
				except:
						pass
		else:
				response.delete_cookie("accessToken")
				response.delete_cookie("refreshToken")
		return response


class RequestPasswordChange(APIView):

		def post(self, request):
				return self.getCode(request)

		def getCode(self, request):
				json_data = json.loads(request.body)
				try:
						userEmail = json_data.get("email")
						user = Users.objects.get(email=userEmail)
				except Users.DoesNotExist:
						return Response({"error": "User with this email is not found"}, status=401)
				except Users.MultipleObjectsReturned:
						return Response(
								{"error": "Multiple users found with the same email"}, status=401
						)
				user_id = user.id

				obj = CustomTokenObtainPairView()
				twoFACode = obj.generate_2fa_code(user, "password")

				obj.send_2fa_code(userEmail, twoFACode.code)

				return Response({"message": "Code Sent", "uid": user_id}, status=200)


class CheckPasswordChange(APIView):

		def post(self, request):
				return self.checkCode(request)

		def checkCode(self, request):
				json_data = json.loads(request.body)
				try:
						user_id = json_data.get("id")
						uuid.UUID(user_id, version=4)
				except ValueError:
						return Response({"error": "invalid id"}, status=400)

				try:
						user = Users.objects.get(id=user_id)
				except Users.DoesNotExist:
						return Response({"error": "User not found"}, status=401)
				except Users.MultipleObjectsReturned:
						return Response(
								{"error": "Multiple users found with the same id"}, status=401
						)

				code = json_data.get("code")
				if code == None:
						return Response({"error": "Code missing"}, status=400)

				newPassword = json_data.get("newPassword")
				if newPassword == None:
						return Response({"error": "newPassword missing"}, status=400)

				if TwoFactorCode.validate_code(user, code, "password") == False:
						return Response({"error": "Code Invalid"}, status=401)

				serializer = PasswordUpdateSerializer(user, data={"new_password": newPassword})

				if serializer.is_valid():
						serializer.save()
						return Response({"error": "Password Updateed"}, status=200)
				else:
						return Response(serializer.errors, status=400)


@api_view(["POST"])
def getUser(request):
		json_data = json.loads(request.body)
		try:
				user_id = json_data.get("id")
				uuid.UUID(user_id, version=4)
		except ValueError:
				return Response({"error": "invalid id"}, status=400)

		try:
				user = Users.objects.get(id=user_id)
		except Users.DoesNotExist:
				return Response({"error": "User not found"}, status=401)
		except Users.MultipleObjectsReturned:
				return Response({"error": "Multiple users found with the same id"}, status=401)

		# user_data = model_to_dict(user, exclude=["password"])
		try:
			serializer = UserSerializer(user)
		except:
			print('yaaarebi salama', flush=True)
		return Response({"user": serializer.data}, status=200)


@api_view(["POST"])
def setUpUsername(request):
		json_data = json.loads(request.body)
		try:
				user_id = json_data.get("id")
				uuid.UUID(user_id, version=4)
		except ValueError:
				return Response({"error": "invalid id"}, status=400)

		try:
				user = Users.objects.get(id=user_id)
		except Users.DoesNotExist:
				return Response({"error": "User not found"}, status=401)
		except Users.MultipleObjectsReturned:
				return Response({"error": "Multiple users found with the same id"}, status=401)

		username = json_data.get("username")
		username = username.lower()
		print(username, flush=True)
		if not username:
				return Response({"error": "username is required"}, status=400)

		if Users.objects.filter(username=username).exists():
				return Response({"error": "This username is already taken."}, status=400)

		user.username = username
		user.save()

		refresh_token = RefreshToken.for_user(user)
		access_token = str(refresh_token.access_token)

		http_response = HttpResponse(content_type="application/json")
		http_response.set_cookie(
				"refreshToken", refresh_token, httponly=True, secure=True, samesite="Lax"
		)
		http_response.set_cookie(
				"accessToken", access_token, httponly=True, secure=True, samesite="Lax"
		)
		data = {"message": "username has been set up"}
		dump = json.dumps(data)
		http_response.content = dump
		return http_response
