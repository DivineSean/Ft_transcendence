
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from games.serializers import GameRoomSerializer
from games.models import GameRoom
from notification.models import Notifications

from tournament.models import Tournament,tournamentPlayer, Bracket
import random

class TournamentManager:
    def __init__(self, tournamentID):
        
        self.tournament = Tournament.objects.get(lobbyID = tournamentID)
        self.channel_layer = get_channel_layer()

    def initialize_matches(self):
        try:
            current_bracket = Bracket.objects.get(
                tournament=self.tournament,
                round_number=self.tournament.current_round
            )

            players = list(tournamentPlayer.objects.filter(
                tournament=self.tournament
            ).select_related('user'))
            
            random.shuffle(players) # katdmes l carta
            
            for i in range(0, len(players), 2):
                if i + 1 < len(players):
                    self.create_game_pair([players[i].user, players[i + 1].user], current_bracket)
        except Exception as e:
            print(f"i_m exception : {e}")
            pass
            
    def create_game_pair(self, users, bracket):
        data = {
            "game": self.tournament.game.id,
            "bracket": bracket.id, #new one 
            "players": [
                {"user": users[0].id, "role": 1},
                {"user": users[1].id, "role": 2}
            ]
        }
        #kansifet lik bracket, zidha f serializer
        serializer = GameRoomSerializer(data=data)

        if serializer.is_valid():
            game_room = serializer.create(serializer.validated_data)
            # self.notify_players(users, game_room) mn b3d
        else:
            #chi wahed y dir chi raise wygol hada li lah 3aza wa jal
            pass
            
    def notify_players(self, users, game_room):
        for user in users:
            self.send_game_notif(user, game_room.id)

    def send_game_notif(self, receiver, game_room_id):
        notification, is_new = Notifications.objects.get_or_create(
            notifType="IT",
            userId=receiver,
            senderId=self.tournament.creator,
            senderUsername=self.tournament.creator.user_username,
            targetId=str(game_room_id)
        )

        if not is_new and notification.isRead:
            notification.updateRead()
            group_name = f"notifications_{receiver.id}"
            self._send_ws_notification(group_name)

    def _send_ws_notification(self, group_name):
        async_to_sync(self.channel_layer.group_send)(
            group_name,
            {
                "type": "send_tournament_notification",
                "sender": str(self.tournament.creator.id)
            }
        )

    def handle_game_completion(self, gameRoomID):
        print("I m in HGC")
        game_room = GameRoom.objects.select_related('bracket').get(id=gameRoomID)
        print("Game Room ==> ", game_room, flush=True)
        current_bracket = game_room.bracket
        print("currentBracket =>" , current_bracket, flush=True)
        if current_bracket.isComplete():
            print("im in complete")
            winners = list(current_bracket.getWinners()) # hadi makhshach tdmes since advance tournament, rab7a mn game khaso yti7 m3a rab7a li f game 2, tn system
            print("winners len  = ", len(winners))


            if len(winners) % 2 == 1 :
                pass
            
            if len(winners) == 0: #last case , 2 players li b9aw khrjo mn tn => tn cancelled 
                self.tournament.isCanceled = True
                self.tournament.save()
                return
            elif len(winners) == 1:
                self.tournament.winner = winners[0].user
                self.tournament.isCompleted = True
                self.tournament.save()
                return

            next_bracket = self.tournament.advanceRound()
            if next_bracket:
                print("I m in next Bracket")
                for i in range(0, len(winners), 2):
                    if i + 1 < len(winners):
                        self.create_game_pair( 
                            [winners[i].user, winners[i + 1].user],
                            next_bracket
                        )
                