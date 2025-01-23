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
        data = []
        brackets = instance.get("brackets")
        totalRounds = instance.get("totalRounds")
        maxPlayers = instance.get("maxPlayers")
        currentPlayerCount = instance.get("currentPlayerCount")
        isCompleted = instance.get("isCompleted")
        bracketCounter = 0
        draw_lines = True

        if maxPlayers == currentPlayerCount:
            for bracket in brackets:
                gameRooms = GameRoom.objects.filter(bracket=bracket).order_by("created_at")
                bracketData = {}
                gameRoomCounter = 0
                for gameRoom in gameRooms:
                    gameRoomCounter += 1
                    gameRoomiD = str(gameRoom.id)

                    playersData = TournamentPlayerSerializer(
                        Player.objects.filter(game_room=gameRoom), many=True
                    ).data

                    bracketData[gameRoomiD] = playersData

                totalGamesPerRound = int(
                    maxPlayers / pow(2, bracketCounter + 1))
                for i in range(gameRoomCounter, totalGamesPerRound):

                    draw_lines = False
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

                data.append(bracketData)
                bracketCounter += 1

        while bracketCounter < totalRounds:

            totalGamesPerRound = int(maxPlayers / pow(2, bracketCounter + 1))
            big = {}

            draw_lines = False
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

            data.append(big)
            bracketCounter += 1

        return {
            "isCompleted": isCompleted, # this need to be changed in the future (because we have an issue the player always get a random places even from the second round)
            "currentPlayerCount": currentPlayerCount,
            "maxPlayers": maxPlayers,
            "drawLines": draw_lines,
            "region": data,
        }
