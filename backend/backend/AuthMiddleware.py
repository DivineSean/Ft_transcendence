from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.utils.deprecation import MiddlewareMixin

class sAuthMiddleWare(MiddlewareMixin):
	def __init__(self, get_response):
		self.get_response = get_response
		# self.UnlockedPaths = [
		# 	#"/api/register/",
		
		# ]

	def process_request(self, request):
		if hasattr(request, 'path'):  #HTTP
			# if request.path in self.UnlockedPaths: #hadok no need nchecki 3lihom
			# 	return None

			accessToken = request.COOKIES.get("accessToken")
			refreshToken = request.COOKIES.get("refreshToken")  

			if not accessToken and not refreshToken:
				return JsonResponse({'error': 'ma3rftch chno ndir',}, status=401) #idk chno khsni ndir
			
			
			jwtObj = JWTAuthentication()

			try:
				validatedAccessToken = AccessToken(accessToken)
				user = jwtObj.get_user(validatedAccessToken)
				request.user = user  
				return None
				
			except :
				if not refreshToken:
					return JsonResponse({
						'error': 'No Access No Refresh',
					}, status=401)
				
				try:
					refresh = RefreshToken(refreshToken)
					new_access_token = str(refresh.access_token)
					user = jwtObj.get_user(refresh)
					request.user = user  
			  
					response = JsonResponse({
						'message': 'AccessToken refreshed',
						'access_token': new_access_token
					})
					
		
					response.set_cookie(
						'accessToken', 
						new_access_token,
						httponly=True,
						samesite='Strict'
					)
					return response
				except:
					return JsonResponse({
						'error': 'Both access and refresh tokens are invalid',
					}, status=401)

		
		elif hasattr(request, 'scope'): #ASGI           
			return None
		
		return None

	def process_response(self, request, response):
		return response  # Dima rj3 l9lawi