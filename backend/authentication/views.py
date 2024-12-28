from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import (
	RegisterSerializer,
	PasswordUpdateSerializer,
	UserSerializer,
	UpdateUserSerializer,
)
from django.core.mail import get_connection, EmailMessage
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.views import PasswordResetView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from django.forms.models import model_to_dict
from rest_framework import exceptions, status
from rest_framework.response import Response
from .models import User, TwoFactorCode
from friendship.models import FriendshipRequest, Friendship
from rest_framework.views import APIView
from django.shortcuts import render
from django.core.cache import cache
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.auth.hashers import check_password
import json
from django.utils import timezone
import os
import uuid
import jwt
import re
from PIL import Image
from django.db.models import Prefetch, OuterRef, Subquery, F, Q
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(["POST"])
def alter2FA(request):
	print(request.user)
	return Response("hello")


@api_view(["POST"])
def registerView(request):

	try:
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save()

		return Response(
			serializer.data,
			status=status.HTTP_201_CREATED	
		)
	
	except ValidationError as e:
		return Response(
			e.detail,
			status=status.HTTP_400_BAD_REQUEST
		)

	except Exception as e:
		return Response(
			{"error": str(e)},
			status=status.HTTP_400_BAD_REQUEST
		)



# resend2FACode is a post method to resend the 2FA code
# -> check the user with the email if it's in the database, otherwise return error
# -> then generate a new 2FA code and send it the user's email and return a response
@api_view(["POST"])
def resend2FACode(request):

	user_id = request.data.get("id")
	if not user_id:
		return Response(
			{"error": "no user id provided"},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	try:
		uuid.UUID(user_id, version=4)
		user = User.objects.get(id=user_id)

	except Exception as e:
		return Response(
			{"error": str(e)},
			status=status.HTTP_400_BAD_REQUEST
		)

	code_type = request.data.get("type")
	print(code_type, flush=True)
	if not code_type:
		return Response(
			{"error": "no such code type provided. it must be 'reset' or 'twofa'"},
			status=status.HTTP_400_BAD_REQUEST
		)

	twofaOjt = CustomTokenObtainPairView()
	message_displayed = ''

	if code_type == "reset":
		message_displayed = "reset pasword confirmation code sent successfully"
		type_code = "password"
		two_factor_code = twofaOjt.generate_2fa_code(user, type_code)

	elif code_type == "twofa":
		message_displayed = "two factor authentication code sent successfully"
		type_code = "twoFa"
		two_factor_code = twofaOjt.generate_2fa_code(user, type_code)

	else:
		return Response(
			{"error": "invalid type. it must be 'reset' or 'twofa'"},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	twofaOjt.send_2fa_code(user.email, two_factor_code.code, type_code)

	return Response(
		{"message": message_displayed, "required_2fa": True},
		status=status.HTTP_200_OK
	)


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

	def send_2fa_code(self, user_email, code, codeType):

		if codeType == "password":
			email_message = f"your reset password confirmation code is: {code}"
		else:
			email_message = f"your two factor authentication confirmation code is: {code}"

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
			message = email_message

			EmailMessage(

				subject,
				message,
				email_from,
				recipient_list,
				connection=connection

			).send()

	def checkUsername(self, user, user_id):

		user_username = user.username
		if not user_username:

			return Response(
				{
					"message": "ok",
					"username": user_username,
					"uid": user_id
				},
				status=status.HTTP_200_OK
			)

		else:

			# set the user online
			user.isOnline = True
			user.save()

			refresh_token = RefreshToken.for_user(user)
			access_token = str(refresh_token.access_token)

			response = Response(
				{"message": "logged in successfully!"},
				status=status.HTTP_200_OK
			)

			response.set_cookie(
				"refreshToken",
				refresh_token,
				httponly=True,
				secure=True,
				samesite="Lax",
			)

			response.set_cookie(
				"accessToken",
				access_token,
				httponly=True,
				secure=True,
				samesite="Lax"
			)

			return response


	def post(self, request, *args, **kwargs):

		submitted_2fa_code = request.data.get("2fa_code")

		if not submitted_2fa_code:  # here is the login part

			email = request.data.get("email")
			password = request.data.get("password")
			if not email:
				return Response(
					{"error": "no email provided"},
					status=status.HTTP_400_BAD_REQUEST
				)

			if not password:
				return Response(
					{"error": "no password provided"},
					status=status.HTTP_400_BAD_REQUEST
				)

			try:
				user = User.objects.get(email=email)

			except Exception as e:
				return Response(
					{"error": str(e)},
					status=status.HTTP_400_BAD_REQUEST
				)

			if user and not user.password:
				return Response(
					{"error": "invalid email or password"},
					status=status.HTTP_400_BAD_REQUEST
				)

			user_id = str(user.id)

			userTokens = super().post(request, *args, **kwargs)

			if userTokens.status_code == 200:
				if user.isTwoFa:
					
					two_factor_code = self.generate_2fa_code(user, "twoFa")
					self.send_2fa_code(user.email, two_factor_code.code, "twoFa")

					return Response(
						{
							"message": "2FA code sent",
							"uid": user_id,
							"requires_2fa": True,
						},
						status=status.HTTP_200_OK,
					)

				else:

					return self.checkUsername(user, user_id)

		else:  # here endpoint for 2FA authorization

			user_id = json_data.get("id")
			if not user_id:
				return Response(
					{"error": "no user id provided"},
					status=status.HTTP_400_BAD_REQUEST
				)

			try:
				uuid.UUID(user_id, version=4)
				user = User.objects.get(id=user_id)

			except Exception as e:
				return Response(
					{"error": str(e)},
					status=status.HTTP_400_BAD_REQUEST
				)

			if not TwoFactorCode.validate_code(user, submitted_2fa_code, "twoFa"):

				return Response(
					{"error": "invalid two factor authentication code"},
					status=status.HTTP_400_BAD_REQUEST
				)

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
				"accessToken",
				access_token,
				httponly=True,
				secure=True,
				samesite="Lax"
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

		user_email = request.data.get("email")
		if not user_email:
			return Response(
				{"error": "no email provided"},
				status=status.HTTP_400_BAD_REQUEST
			)

		try:
			user = User.objects.get(email=user_email)

		except Exception as e:
			return Response(
				{"error": str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		user_id = user.id

		obj = CustomTokenObtainPairView()
		twoFACode = obj.generate_2fa_code(user, "password")

		obj.send_2fa_code(user_email, twoFACode.code, "password")

		return Response(
			{"message": "the code sent to your email successfully", "uid": str(user_id)},
			status=status.HTTP_200_OK
		)


class CheckPasswordChange(APIView):

	def post(self, request):
		return self.checkCode(request)

	def checkCode(self, request):

		user_id = request.data.get("id")
		if not user_id:
			return Response(
				{"error": "no user id provided"},
				status=status.HTTP_400_BAD_REQUEST
			)

		code = request.data.get("code")
		if not code:
			return Response(
				{"error": "no code provided"},
				status=status.HTTP_400_BAD_REQUEST
			)

		newPassword = request.data.get("newPassword")
		if not newPassword:
			return Response(
				{"error": "no password provided"},
				status=status.HTTP_400_BAD_REQUEST
			)

		try:
			uuid.UUID(user_id, version=4)
			user = User.objects.get(id=user_id)

		except Exception as e:
			return Response(
				{"error": str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)


		if TwoFactorCode.validate_code(user, code, "password") == False:
			return Response(
				{"error": "code provided is invalid"},
				status=status.HTTP_400_BAD_REQUEST
			)

		serializer = PasswordUpdateSerializer(user, data={"new_password": newPassword})

		if serializer.is_valid():
			serializer.save()
			return Response(
				{"message": "password updated successfully"},
				status=status.HTTP_200_OK
			)
		else:
			return Response(
				{"error": "invalid password"},
				status=status.HTTP_400_BAD_REQUEST
			)


class Profile(APIView):

	def get(self, request, username=None):

		foundedUser = True

		try:
			if not username:
				username = request._user.username
			user = User.objects.filter(username=username).first()

			if not user:
				user = request._user
				foundedUser = False

		except:
			user = request._user
			foundedUser = False

		if user.profile_image:

			imagePath = os.path.join(settings.MEDIA_ROOT, str(user.profile_image))
			if not os.path.exists(imagePath):
				user.profile_image = None
				user.save()

		extraFields = {}

		if foundedUser and user != request._user:

			isBlockedByUser = str(request._user.id) in user.blockedUsers or False
			if isBlockedByUser:
				return Response(
					{"error": "you are blocked by the user"},
					status=status.HTTP_400_BAD_REQUEST,
				)

			isFriend = Friendship.objects.filter(
				Q(user1=user, user2=request._user) | Q(user1=request._user, user2=user)
			).exists()

			isSentRequest = FriendshipRequest.objects.filter(
				fromUser=user, toUser=request._user
			).exists()

			isReceiveRequest = FriendshipRequest.objects.filter(
				fromUser=request._user, toUser=user
			).exists()

			isUserBlocked = str(user.id) in request._user.blockedUsers or False

			extraFields = {
				"isFriend": isFriend,
				"isSentRequest": isSentRequest,
				"isBlockedByUser": isBlockedByUser,
				"isUserBlocked": isUserBlocked,
				"isReceiveRequest": isReceiveRequest,
			}

		serializer = UserSerializer(user)
		return Response(
			{
				**serializer.data,
				"found": foundedUser,
				"me": user.id == request._user.id,
				**extraFields,
			},
			status=status.HTTP_200_OK,
		)

	def put(self, request, username=None):

		user = request.user
		new_username = request.data.get("username", None)

		if new_username:
			new_username = new_username.lower()
			username_regex = re.compile(r"^[a-zA-Z][a-zA-Z0-9_-]{3,}$")
			if not username_regex.match(new_username):
				return Response(
					{"username": "invalid username, examples user, user1, user-12, user_12"},
					status=status.HTTP_400_BAD_REQUEST,
				)
			if User.objects.filter(username=new_username).exclude(id=user.id).exists():
				return Response(
					{"username": "this username is already taken"},
					status=status.HTTP_400_BAD_REQUEST,
				)
			else:
				user.username = new_username
				user.save()

		file = request.FILES.get("profile_image")
		if file:
			try:
				Image.open(file).verify()
			except Exception:
				pass

			fs = FileSystemStorage(location=settings.MEDIA_ROOT + "/profile_images")

			if fs.exists(file.name):
				fs.delete(file.name)

			savedFile = fs.save(file.name, file)
			user.profile_image = f"profile_images/{savedFile}"
			user.save()

		serializer = UpdateUserSerializer(user, data=request.data, partial=True)
		if serializer.is_valid():
			serializer.save()
			print("User updated successfully", flush=True)

		else:
			print("Error in serializer validation", flush=True)

		serializer = UserSerializer(user)

		return Response(
			{**serializer.data, "me": user.id == request._user.id},
			status=status.HTTP_200_OK,
		)


@api_view(["POST"])
def setUpUsername(request):

	user_id = request.data.get("id")
	if not user_id:
		return Response(
			{"error": "no user id provided"},
			status=status.HTTP_400_BAD_REQUEST
		)

	username = request.data.get("username")
	if not username:
		return Response(
				{"error": "no username provided"},
				status=status.HTTP_400_BAD_REQUEST
			)

	username = username.lower()
	username_regex = re.compile(r"^[a-zA-Z][a-zA-Z0-9_-]{3,}$")
	if not username_regex.match(username):
		return Response(
			{"error": "invalid username, examples user, user1, user-12, user_12"},
			status=status.HTTP_400_BAD_REQUEST,
		)

	try:

		uuid.UUID(user_id, version=4)
		user = User.objects.get(id=user_id)

	except Exception as e:
		return Response(
			{"error": str(e)},
			status=status.HTTP_400_BAD_REQUEST
		)

	
	if User.objects.filter(username=username).exists():
		return Response(
			{"error": "This username is already taken."},
			status=status.HTTP_400_BAD_REQUEST
		)

	user.username = username
	user.save()

	refresh_token = RefreshToken.for_user(user)
	access_token = str(refresh_token.access_token)

	response = Response(
		{"message": "setup completed successfully! welcome"},
		status=status.HTTP_200_OK
	)

	response.set_cookie(
		"refreshToken",
		refresh_token,
		httponly=True,
		secure=True,
		samesite="Lax"
	)

	response.set_cookie(
		"accessToken",
		access_token,
		httponly=True,
		secure=True,
		samesite="Lax"
	)

	return response


@api_view(["GET"])
def checkUserIsAuthenticated(request):
	return Response({"message": "authenticated user"}, status=status.HTTP_200_OK)
