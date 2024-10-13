from rest_framework import serializers
from .models import Users

class RegisterSerializer(serializers.ModelSerializer):
	class Meta:
		model = Users
		fields = ['id', 'first_name', 'last_name', 'email', 'password']
		extra_kwargs = {'password': {'write_only': True}}
	
	def create(self, validated_data):
		password = validated_data.pop('password', None)
		instance = self.Meta.model(**validated_data)
		if password is not None:
			instance.set_password(password)
		instance.save()
		return instance

class RegisterOAuthSerializer(serializers.ModelSerializer):
	class Meta:
		model = Users
		fields = ['id', 'first_name', 'last_name', 'email', 'password']
		extra_kwargs = {'password': {'write_only': True}}
	
	def create(self, validated_data):
		password = validated_data.pop('password', None)
		instance = self.Meta.model(**validated_data)
		instance.save()
		return instance