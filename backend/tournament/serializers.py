from rest_framework import serializers
from .models import Tournament
from games.serializers import GameSerializer


class TournamentSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format="hex_verbose", read_only=True)

    class Meta:
        model = Tournament
        fields = ["id"]



class getTournamentSerializer(serializers.ModelSerializer): 
    isCreator = serializers.SerializerMethodField()
    gameData = GameSerializer(source = "game",read_only=True)
    created_at = serializers.DateTimeField(format="%b %d, %Y")
    
    class Meta:
        model = Tournament
        fields = ["id","isCreator","tournamentTitle", "created_at", "maxPlayers", "currentPlayerCount", "isCanceled", "gameData"]
    
    def get_isCreator(self, obj):
        if self.context == obj.creator:
            return True
        return False