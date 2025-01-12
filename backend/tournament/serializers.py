from rest_framework import serializers
from .models import Tournament


class TournamentSerializer(serializers.ModelSerializer):
    lobbyID = serializers.UUIDField(format="hex_verbose", read_only=True)

    class Meta:
        model = Tournament
        fields = ["lobbyID"]
