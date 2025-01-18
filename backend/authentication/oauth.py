from django.shortcuts import render
import requests
from django.shortcuts import redirect
from django.http import HttpResponse
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import User
from django.contrib.auth.hashers import make_password
from .views import CustomTokenObtainPairView, registerView
from .serializers import RegisterOAuthSerializer
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.core.files.base import ContentFile
from rest_framework import status
import requests
import os, json
import uuid

CLIENT_ID = os.environ.get("CLIENT_ID")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
REDIRECT_URL = os.environ.get("REDIRECT_URL")  # change reedirect url

G_CLIENT_ID = os.environ.get("G_CLIENT_ID")
G_CLIENT_SECRET = os.environ.get("G_CLIENT_SECRET")


def download_providers_images(url, userId):
    response = requests.get(url)
    if response.status_code == 200:
        file_name = f"{userId}_profile.jpeg"
        return ContentFile(response.content, file_name)
    return None


def CreateUserIfNotExists(user_data, isIntra):

    userID = user_data.get("id")
    login = user_data.get("login")
    email = user_data.get("email")

    if isIntra:
        image_url = user_data.get("image")["versions"]["large"]
        first_name = user_data.get("first_name")
        last_name = user_data.get("last_name")

    else:
        image_url = user_data.get("picture")
        first_name = user_data.get("given_name")
        last_name = user_data.get("family_name")

    print(image_url, flush=True)
    password = None

    data = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password": password,
        "image_url": image_url,
    }

    user = User.objects.filter(email=email).first()

    if user:
        return True, data
    else:
        return False, data


@api_view(["GET"])
def login42(request):
    response = HttpResponse(content_type="application/json")
    data = {
        "url": f"https://api.intra.42.fr/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URL}&response_type=code"
    }
    dump = json.dumps(data)
    response.content = dump

    return response


@api_view(["GET"])
def loginGoogle(request):
    response = HttpResponse(content_type="application/json")
    data = {
        "url": f"https://accounts.google.com/o/oauth2/v2/auth?client_id={G_CLIENT_ID}&redirect_uri={REDIRECT_URL}&response_type=code&scope=email%20profile"
    }
    dump = json.dumps(data)
    response.content = dump

    return response


@api_view(["POST"])
def callback(request):
    code = request.data.get("code", None)
    if not code:
        return Response(
            {"error": "no code provided"}, status=status.HTTP_400_BAD_REQUEST
        )
    prompt = request.data.get("prompt", None)

    if not prompt:  # for intra provider
        token_response = requests.post(
            "https://api.intra.42.fr/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code": code,
                "redirect_uri": REDIRECT_URL,
            },
        )

    else:  # for google provider
        token_response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "grant_type": "authorization_code",
                "client_id": G_CLIENT_ID,
                "client_secret": G_CLIENT_SECRET,
                "code": code,
                "redirect_uri": REDIRECT_URL,
            },
        )

    access_token = token_response.json().get("access_token")
    if not access_token:
        return Response(
            {"error": "Failed to obtain access token"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    isIntra = False
    if not prompt:
        user_response = requests.get(
            "https://api.intra.42.fr/v2/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        isIntra = True

    else:
        user_response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if user_response.status_code == 200:

        user_data = user_response.json()
        is_new_user, data = CreateUserIfNotExists(user_data, isIntra)

        if not is_new_user:
            serializer = RegisterOAuthSerializer(data=data)
            # serializer.is_valid()
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(
                    {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
                )

        user = User.objects.get(email=user_data.get("email"))
        if not user.profile_image:
            image_file = download_providers_images(data["image_url"], user.id)

            if image_file:
                user.profile_image.save(image_file.name, image_file, save=True)

        username = user.username

        if user.isTwoFa:
            twofaOjt = CustomTokenObtainPairView()
            two_factor_code = twofaOjt.generate_2fa_code(user, "twoFa")
            twofaOjt.send_2fa_code(user.email, two_factor_code.code, "twoFa")
            data = {
                "message": "two factor authentication code sent successfully",
                "uid": str(user.id),
                "requires_2fa": True,
            }
            return Response(data, status=status.HTTP_200_OK)

        else:
            if not username:
                data = {
                    "message": "still one further step to complete",
                    "username": username,
                    "uid": str(user.id),
                }
                dump = json.dumps(data)
                return Response(data, status=status.HTTP_200_OK)

            else:

                response = Response(
                    {"message": "you logged in successfully"}, status=status.HTTP_200_OK
                )

                refresh_token = RefreshToken.for_user(user)
                access = str(refresh_token.access_token)

                response.set_cookie(
                    "refreshToken",
                    refresh_token,
                    httponly=True,
                    secure=True,
                    samesite="Lax",
                )
                response.set_cookie(
                    "accessToken", access, httponly=True, secure=True, samesite="Lax"
                )

                return response

    else:
        return Response(
            {"error": "cannot login please try again"},
            status=status.HTTP_400_BAD_REQUEST,
        )
