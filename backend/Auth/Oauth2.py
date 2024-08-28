from django.shortcuts import render
from  django.http import HttpResponse
import requests
from django.shortcuts import redirect
from django.http import HttpResponse
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import Users
from django.contrib.auth.hashers import make_password


CLIENT_ID = os.environ.get("CLIENT_ID")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
REDIRECT_URL = os.environ.get("REDIRECT_URL") #change reedirect url


G_CLIENT_ID = os.environ.get("G_CLIENT_ID")
G_CLIENT_SECRET = os.environ.get("G_CLIENT_SECRET")


def CreateUserIfNotExists(user_data):

    userID = user_data.get('id')
    login = user_data.get('login', '')   
    email = user_data.get('email')
    first_name = user_data.get('first_name') or user_data.get('given_name')
    last_name = user_data.get('last_name') or user_data.get('family_name')
    password =  ""
    try:
        user, created = Users.objects.get_or_create(
            email=email,
                defaults={
                    'userID': str(userID),
                    'login': login,
                    'first_name': first_name,
                    'last_name': last_name,
                    'password' : make_password(None)
                }
         )
        return created
    except IntegrityError as e:
        print(f"Error creating user: {e}")
        return False

@api_view(['GET'])
def login42(request):
    return redirect(f'https://api.intra.42.fr/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URL}&response_type=code')

@api_view(['GET'])
def loginGoogle(request):
    return redirect(f'https://accounts.google.com/o/oauth2/v2/auth?client_id={G_CLIENT_ID}&redirect_uri={REDIRECT_URL}&response_type=code&scope=email%20profile')

@api_view(['GET'])
def show_users(request):
    users = Users.objects.all().values()  
    user_list = list(users)  
    return JsonResponse(user_list, safe=False)
    
@api_view(['GET'])   
def  home(request):
    GoogleFlag = False
    auth_code = request.GET.get('code')
    try:
        prompt = request.GET.get('prompt')
        GoogleFlag = True
    except :
        pass
    if prompt == None:
        GoogleFlag = False
    if not auth_code:
        return Response({'error': 'No authorization code provided'}, status=400)
    if GoogleFlag == False:
        token_response = requests.post(
            'https://api.intra.42.fr/oauth/token',
            data={
                'grant_type': 'authorization_code',
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'code': auth_code,
                'redirect_uri': REDIRECT_URL
            }
        )
    else:
        token_response = requests.post(
        'https://oauth2.googleapis.com/token',
        data={
            'grant_type': 'authorization_code',
            'client_id': G_CLIENT_ID,
            'client_secret': G_CLIENT_SECRET,
            'code': auth_code,
            'redirect_uri': REDIRECT_URL,
        }
    )

    access_token = token_response.json().get('access_token')
    if not access_token:
        return Response({'error': 'Failed to obtain access token'}, status=400)
    if GoogleFlag == False:
        user_response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {access_token}'})
    else: 
        user_response = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', headers={'Authorization': f'Bearer {access_token}'})

    if user_response.status_code == 200:
        user_data = user_response.json()
        is_new_user = CreateUserIfNotExists(user_data)
        return Response({
            'access_token': access_token,
            'user_data': user_data,
            'isNewUser' : is_new_user
        })
        # To test
    else:
        return Response({'error': 'Failed to fetch user data'}, status=400)
    
