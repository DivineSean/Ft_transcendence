import asyncio
from .models import Match
from time import sleep
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from games.models import Game, GameRoom
class TournamentManager: 
    def __init__(self, lobby):
        self.matches = Match.objects.filter(lobby=lobby)
        self.players = list(lobby.players.all())

        # self.sendGameNotif()

    def sendGameNotif(self):
        for match_ in self.matches: 
            self.player1ID = match_.player1.user.id
            self.player2ID = match_.player2.user.id
            channel_layer = get_channel_layer()
            
            channel_layer.group_send()(
                f"notification_ {self.player1ID}",
                {
                    "type":"send_notification",
                    "message":f"Tournament is Starting, the game will start after 1 minute",
                    "sender": None,
                    "receiver" : self.player1ID
                }
            )
            channel_layer.group_send()(
                f"notification_ {self.player2ID}",
                {
                    "type":"send_notification",
                    "message":f"Tournament is Starting, the game will start after 1 minute",
                    "sender": None,
                    "receiver" : self.player2ID
                }
            )
        sleep(60)
        self.startGame()
            
        
    def startGame(self):
        # print(Game.objects.all())
        GameRoomObj = GameRoom.objects.create(
            game = Game.objects.get(name="pong"),
        )
        #create player1, create player2
        print(GameRoomObj)

        
    def waitGame(self, time): 
        sleep(time)