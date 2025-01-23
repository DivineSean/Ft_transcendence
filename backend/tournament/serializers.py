from rest_framework import serializers
from .models import Tournament
from games.models import GameRoom, Player
from games.serializers import GameSerializer
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


class TournamentPlayerSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username")
    profile_image = serializers.SerializerMethodField()
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

    def get_profile_image(self, obj):
        from authentication.serializers import UserSerializer

        user_serializer = UserSerializer(obj.user).data
        return user_serializer.get("profile_image")


class TournamentDataSerializer(serializers.Serializer):

    def to_representation(self, instance):
        self.data_ = []
        self.bracketsCount = instance.get("bracketsCount")
        brackets = instance.get("brackets")
        self.totalRounds = instance.get("totalRounds")
        self.maxPlayers = instance.get("maxPlayers")
        currentPlayerCount = instance.get("currentPlayerCount")
        isCompleted = instance.get("isCompleted")
        self.bracketCounter = 0
        self.draw_lines = True
        
       
        
        if self.maxPlayers == currentPlayerCount:
            # for self.bracketCounter in range(0, self.totalRounds):
                for bracket in brackets:  
                    print("BRACKET COUNTER === ",self.bracketCounter, flush=True)
                    if bracket.round_number != self.bracketCounter + 1:
                        self.advanceBracket()
                        self.bracketCounter +=  1
                        
                    if bracket.round_number == self.bracketCounter:
                        print("here", flush=True)
                        gameRooms = GameRoom.objects.filter(bracket=bracket).order_by("created_at")
                        bracketData = {}
                        gameRoomCounter = 0
                        for gameRoom in gameRooms:
                            gameRoomCounter += 1
                            gameRoomiD = str(gameRoom.id)

                            playersData = TournamentPlayerSerializer(
                                Player.objects.filter(game_room=gameRoom).order_by("created_at"), many=True
                            ).data

                            bracketData[gameRoomiD] = playersData

                        totalGamesPerRound = int(
                            self.maxPlayers / pow(2, self.bracketCounter + 1))
                        for i in range(gameRoomCounter, totalGamesPerRound):

                            self.draw_lines = False
                            bracketData[str(uuid4())] = [
                                {
                                    "id": "",
                                    "result": "",
                                    "score": "",
                                    "username": "",
                                    "profile_image": "",
                                },
                                {
                                    "id": "",
                                    "result": "",
                                    "score": "",
                                    "username": "",
                                    "profile_image": "",
                                },
                            ]

                        self.data_.append(bracketData)
                        self.bracketCounter += 1                     


        while self.bracketCounter < self.totalRounds:
            self.advanceBracket()
          
        
        return {
            "isCompleted": isCompleted,
            "currentPlayerCount": currentPlayerCount,
            "maxPlayers": self.maxPlayers,
            "drawLines": self.draw_lines,
            "region": self.data_,
        }

    def advanceBracket(self):
            
            # should be in func
            totalGamesPerRound = int(self.maxPlayers / pow(2, self.bracketCounter + 1))
            big = {}

            self.draw_lines = False
            for i in range(0, totalGamesPerRound):

                big[str(uuid4())] = [
                    {
                        "id": "",
                        "result": "",
                        "score": "",
                        "username": "",
                        "profile_image": "",
                    },
                    {
                        "id": "",
                        "result": "",
                        "score": "",
                        "username": "",
                        "profile_image": "",
                    },
                ]

            self.data_.append(big)
            

      