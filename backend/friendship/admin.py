from django.contrib import admin
from .models import Friendship, FriendshipRequest

admin.site.register(Friendship)
admin.site.register(FriendshipRequest)
# admin.site.register(ManageFriendship)
# Register your models here.
