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
from .models import IntraUser
from django.contrib.auth.hashers import make_password


CLIENT_ID = os.environ.get("CLIENT_ID")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
REDIRECT_URL = os.environ.get("REDIRECT_URL") #change reedirect url

def CreateUserIfNotExists(user_data):

    intraId = user_data.get('id')
    login = user_data.get('login')   
    email = user_data.get('email')
    first_name = user_data.get('first_name')
    last_name = user_data.get('last_name')
    
    try:
        user, created = IntraUser.objects.get_or_create(
            email=email,
                defaults={
                    'intraID': intraId,
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
def login(request):
    return JsonResponse({
        'login_url': f'https://api.intra.42.fr/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URL}&response_type=code'
    })

@api_view(['GET'])
def show_users(request):
    users = IntraUser.objects.all().values()  
    user_list = list(users)  
    return JsonResponse(user_list, safe=False)

@api_view(['POST'])
def callback(request):
    
    auth_code = request.data.get('code')
    if not auth_code:
        return Response({'error': 'No authorization code provided'}, status=400)

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
    
    access_token = token_response.json().get('access_token')
    if not access_token:
        return Response({'error': 'Failed to obtain access token'}, status=400)

    user_response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {access_token}'})
    
    if user_response.status_code == 200:
        user_data = user_response.json()
        is_new_user = CreateUserIfNotExists(user_data)
        return Response({
            'access_token': access_token,
            'user_data': user_data,
            'isNewUser' : is_new_user
        })
    else:
        return Response({'error': 'Failed to fetch user data'}, status=400)
    
def  home(request):
    return(HttpResponse("hello"))
# def test(request):
    
#     if  request.session.get('access_token') == None:
#         return redirect('/intra')
        
    
#     return HttpResponse(request.session.get('access_token'))

# def logout(request):
    
#     request.session.flush()
    
#     return redirect("/")