from rest_framework import serializers
from .models import Game
from Auth.models import Users as User

class GameSerializer(serializers.ModelSerializer):
    player_one = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    player_two = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Game
        fields = '__all__'

    def validate(self, attrs):
        if attrs['player_one'] == attrs['player_two']:
            raise serializers.ValidationError("Players must be different.")
        return attrs

    def create(self, validated_data):
        game = Game.objects.create(**validated_data)
        return game
