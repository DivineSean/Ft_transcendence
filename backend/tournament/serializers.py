from rest_framework import serializers
from .models import Tournament, Bracket
from games.models import GameRoom, Player
from games.serializers import GameSerializer, PlayerSerializer
from .serializers import PlayerSerializer
import math
from uuid import uuid4
class TournamentSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format="hex_verbose", read_only=True)

    class Meta:
        model = Tournament
        fields = ["id"]


class getTournamentSerializer(serializers.ModelSerializer):
    isCreator = serializers.SerializerMethodField()
    gameData = GameSerializer(source="game", read_only=True)
    created_at = serializers.DateTimeField(format="%b %d, %Y")

    class Meta:
        model = Tournament
        fields = [
            "id",
            "isCreator",
            "tournamentTitle",
            "created_at",
            "maxPlayers",
            "currentPlayerCount",
            "isCanceled",
            "gameData",
        ]

    def get_isCreator(self, obj):
        if self.context == obj.creator:
            return True
        return False


class TournamentPlayerSerializer(PlayerSerializer):

    username = serializers.CharField(source="user.username")
    profile_image = serializers.CharField(source="user.profile_image")
    id = serializers.CharField(source="user.id")

    class Meta:
        model = Player
        fields = [
            "id",
            "result",
            "score",
            "username",
            "profile_image",
        ]


class TournamentDataSerializer(serializers.Serializer):
    
    def to_representation(self, instance):
        data = []
        brackets = instance.get("brackets")
        totalRounds = instance.get("totalRounds")
        maxPlayers = instance.get("maxPlayers")
        bracketCounter = 0
        for bracket in brackets:
            
            gameRooms = GameRoom.objects.filter(bracket=bracket)
            bracketData = {}
            for gameRoom in gameRooms:
                gameRoomiD = str(gameRoom.id)

                playersData = TournamentPlayerSerializer(
                    Player.objects.filter(game_room=gameRoom), many=True
                ).data

                bracketData[gameRoomiD] = playersData

            # print(bracketData, flush=True)  
            data.append(bracketData)
            
            bracketCounter += 1
        
        
        
        while bracketCounter < totalRounds:

            totalGamesPerRound = int(maxPlayers / pow(2  , bracketCounter + 1))
            big = {}
            for i in range(0, totalGamesPerRound) :
                
                big[str(uuid4())] = [
                        {
                            "id" : "",
                            "result": "",
                            "score": "",
                            "username": "",
                            "profile_image": "",
                        }, 
                        {
                            "id" : "",
                            "result": "",
                            "score": "",
                            "username": "",
                            "profile_image": "",
                        },]
                                    
            data.append(big)
            bracketCounter +=1 
                
        return {"region": data}

