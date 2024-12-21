from .models import Notifications
from Auth.serializers import UserFriendSerializer
from rest_framework import serializers

class NotifSerializer(serializers.ModelSerializer):
	# timestamp = serializers.DateTimeField(format="%b %d, %H:%M")
	senderId = UserFriendSerializer()

	class Meta:
		model =  Notifications
		fields = "__all__"