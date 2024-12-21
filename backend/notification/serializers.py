from .models import Notifications
from Auth.serializers import UserFriendSerializer
from rest_framework import serializers

class NotifSerializer(serializers.ModelSerializer):
	timestamp = serializers.DateTimeField(format="%b %d, %H:%M")
	senderId = UserFriendSerializer()
	# unreadCount = serializers.SerializerMethodField()

	class Meta:
		model =  Notifications
		fields = "__all__"
		# extra_fields = ['unreadCount']
	
	# def get_unreadCount(self, obj):
	# 	request = self.context.get('request')
	# 	print(self.context, flush=True)
	# 	if request:
	# 		user = request.user
	# 		return Notifications.objects.filter(userId=user.id, isRead=False).count()
	# 	return 0