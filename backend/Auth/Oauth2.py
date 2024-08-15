from django.shortcuts import render
from  django.http import HttpResponse
import requests
from django.shortcuts import redirect
from django.http import HttpResponse
# Create your views here.


CLIENT_ID = 'clientID'
CLIENT_SECRET = 'secretID'
REDIRECT_URL = 'http://127.0.0.1:8000/intra' #change reedirect url

def home(request):
    
    if 'code' in request.GET:
        auth_code = request.GET['code']
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
        
        access_token = token_response.json()
        access_token = access_token.get('access_token')
        # refresh_token = access_token.get('refresh_token')
        # if access_token == None:
        #     return "bad key"

        
        request.session['access_token'] = access_token
        
        response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {access_token}'})
        
        if response.status_code == 200:
            
            user_data = response.json()
            data = user_data
            first_name = data["first_name"]
            
            return HttpResponse(f"Hello, {first_name}")
        else:
            # Handle error
            print('Error:', response.status_code)
        
    else:
        return redirect(f'https://api.intra.42.fr/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URL}&response_type=code')
    

# def test(request):
    
#     if  request.session.get('access_token') == None:
#         return redirect('/intra')
        
    
#     return HttpResponse(request.session.get('access_token'))

# def logout(request):
    
#     request.session.flush()
    
#     return redirect("/")