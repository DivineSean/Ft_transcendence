from django.contrib import admin
from django.urls import path,include
from . import views
from . import Oauth2
import re
import   os

match = re.search(r'/(?P<pattern>[^/]+)$', str(os.environ.get("REDIRECT_URL")))
RedirectURL = match.group('pattern') + '/'
urlpatterns = [
    path('api/login/', Oauth2.login, name='login'),
    path('api/callback/', Oauth2.callback, name='callback'),
    path(RedirectURL, Oauth2.hello, name='hello'),
]