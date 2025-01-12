
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from games.serializers import GameRoomSerializer
from games.models import GameRoom
from notification.models import Notifications
from games.models import Player
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
        current_bracket = game_room.bracket
        
        if current_bracket.isComplete():
            print("im in complete")
            winners = list(current_bracket.getWinners())
            print("winners len = ", len(winners))
            
            skippedPlayerss = Player.objects.filter( # normally hadi makhshach trowi error
                    game_room__bracket__round_number=current_bracket.round_number - 1,
                    should_skip_next=True
                ).select_related('user')
            # totalPlayers = len(winners) + len(skippedPlayerss) #maybe nchecki bhadi not sure
            if len(winners) == 0: #maybe khsni n checki 3la skipped players hna
                self.tournament.isCanceled = True
                self.tournament.save()
                return
            elif len(winners) == 1: # w ta hna not sure
                self.tournament.winner = winners[0].user
                self.tournament.isCompleted = True
                self.tournament.save()
                return

            next_bracket = self.tournament.advanceRound()
            if next_bracket:
                allPlayers = list(winners)
                for skipped in skippedPlayerss:
                    
                    skipped.should_skip_next = False
                    skipped.save()
                    allPlayers.append(skipped)
                    print("I m in next Bracket")
                self.createNextBracketGames(allPlayers, next_bracket)
    
    def PlayerSkip(self, winners):
        pattern = ['W' if w.result == Player.Result.WIN else 'D' for w in winners] #kan converti lista 
        
        for i in range(len(pattern) - 1):
            if pattern[i:i+2] == ['D', 'D']:  #  l9it joj li deconectaw 
                
                if i > 0 and pattern[i-1] == 'W': # la kan l winner 9bel dissconnected game
                    skipIndex = i - 1
                
                elif i + 2 < len(pattern) and pattern[i+2] == 'W': # la kan l winner mn b3d dissconnected game
                    skipIndex = i + 2
                else:
                    continue
                    
                # kanakhed ga3 l winners ila li khshom yt skipaw 
                activePlayers = [w for w in winners 
                                if w.result == Player.Result.WIN and winners.index(w) != skipIndex]
                return skipIndex, activePlayers
                
        return None, winners

    def createNextBracketGames(self, winners, next_bracket):
        skipIndex, activePlayerss = self.PlayerSkip(winners)
        
        if skipIndex is not None:
            # khona li khso ytskipa (hadi bach ntfker nzid skipp player f player model)
            skippingPlayer = winners[skipIndex]
            skippingPlayer.should_skip_next = True
            skippingPlayer.save()
            playersToMatch = activePlayerss
        else:
            playersToMatch = winners

        # hadi la makan tawahed khso ytskipa
        for i in range(0, len(playersToMatch), 2):
            if i + 1 < len(playersToMatch):
                self.create_game_pair(
                    [playersToMatch[i].user, playersToMatch[i + 1].user],
                    next_bracket
                )

    