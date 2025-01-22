from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from games.serializers import GameRoomSerializer
from games.models import GameRoom
from notification.models import Notifications
from games.models import Player
from tournament.models import Tournament, tournamentPlayer, Bracket
from games.tasks import mark_game_room_as_expired
from matchmaking.matchmaker import GAME_EXPIRATION
import random
import redis
from django.conf import settings

r = redis.Redis(
    host=settings.REDIS_CONNECTION["host"],
    port=settings.REDIS_CONNECTION["port"],
    password=settings.REDIS_CONNECTION["password"],
    db=settings.REDIS_CONNECTION["db"],
    decode_responses=True,
)


class TournamentManager:
    def __init__(self, tournamentID):

        self.tournament = Tournament.objects.get(id=tournamentID)
        self.channel_layer = get_channel_layer()

    def initialize_matches(self):
        try:
            current_bracket = Bracket.objects.get(
                tournament=self.tournament, round_number=self.tournament.current_round
            )

            players = list(
                tournamentPlayer.objects.filter(
                    tournament=self.tournament
                ).select_related("user")
            )

            random.shuffle(players)  # katdmes l carta
            print("*********************************8**8****", flush=True)
            for i in range(0, len(players), 2):
                if i + 1 < len(players):
                    self.create_game_pair(
                        [players[i].user, players[i + 1].user], current_bracket
                    )
        except Exception as e:
            print(f"------------------i_m exception : {e}")
            pass

    def create_game_pair(self, users, bracket):
        data = {
            "game": self.tournament.game.id,
            "bracket": bracket.id,
            "players": [
                {"user": users[0].id, "role": 1},
                {"user": users[1].id, "role": 2},
            ],
        }
        # kansifet lik bracket, zidha f serializer
        serializer = GameRoomSerializer(data=data)
        print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", flush=True)

        if serializer.is_valid():
            game_room = serializer.create(serializer.validated_data)
            mark_game_room_as_expired.apply_async(
                args=[game_room.id], countdown=GAME_EXPIRATION
            )
            print("######################################", flush=True)
            self.notify_players(users, game_room)
        else:
            print("+++++++++++++++++++++++++++IM in else condition", flush=True)
            # chi wahed y dir chi raise wygol hada li lah 3aza wa jal
            pass

    def notify_players(self, users, game_room):
        for user in users:
            self.send_game_notif(user, game_room.id)
            
    def send_game_notif(self, receiver, game_room_id=None, message = None):
        if message != None:
                notification, is_new = Notifications.objects.get_or_create(
                notifType="IT",
                userId=receiver,
                senderId=self.tournament.creator,
                game=self.tournament.game.name,
                notifMessage = message,
                senderUsername=self.tournament.creator.username,
               
            )
        else:
            notification, is_new = Notifications.objects.get_or_create(
                notifType="IT",
                userId=receiver,
                senderId=self.tournament.creator,
                game=self.tournament.game.name,
                senderUsername=self.tournament.creator.username,
                targetId=str(game_room_id),
            )

        if not is_new and notification.isRead:
            notification.updateRead()
            group_name = f"notifications_{receiver.id}"
            self._send_ws_notification(group_name)

    def _send_ws_notification(self, group_name, messsage = None):
        async_to_sync(self.channel_layer.group_send)(
            group_name,
            {
                "type": "send_tournament_notification",
                "sender": str(self.tournament.creator.id),
            },
        )

    def handle_game_completion(self, gameRoomID):
        
        print("I m in HGC")
        game_room = GameRoom.objects.select_related("bracket").get(id=gameRoomID)
        current_bracket = game_room.bracket
        
        lock = r.get(f"bracket_data:{current_bracket.id}:lock")
        # lock = r.get(f"bracket_data:{current_bracket.id}:lock")
        print(f"ha dak lock t*b: {lock}", flush=True)
        if lock is not None:
            print("ACCESS DENIED", flush=True)
            return
        print("ANA DEZT WALAYNI NOT COMPLETE", flush=True)
        if current_bracket.isComplete():
            
            lock = r.set(f"bracket_data:{current_bracket.id}:lock","", nx=True, ex=5)
            if lock is False:
                print("NADAFAK BRO", flush=True)
                return

            print("im in complete",flush=True)
            winners, allData = current_bracket.getWinners() # allData must be winners + disconneceted
        

            skippedPlayerss = (
                Player.objects.filter(  # normalement hadi makhshach trowi error
                    game_room__bracket__round_number=current_bracket.round_number - 1,
                    should_skip_next=True,
                ).select_related("user")
            )
        
            winners = winners + list(skippedPlayerss)
            
            # totalPlayers = len(winners) + len(skippedPlayerss) #maybe khsni nchecki bhadi not sure
            if len(winners) == 0:  # maybe khsni n checki 3la skipped players hna
                self.tournament.refresh_from_db()
                self.tournament.isCanceled = True
                self.tournament.save()
                return
            elif len(winners) == 1:  # w ta hna not sure
                self.tournament.refresh_from_db()
                self.tournament.winner = winners[0].user
                self.tournament.isCompleted = True
                self.tournament.save()
                return

            nextBrackeet = self.tournament.advanceRound()
            if nextBrackeet:
                print("Im in next Bracket")
                self.createNextBracketGames(winners ,  allData, nextBrackeet)
            

    def PlayerSkip(self, allData):
        skipIndex = []
        pattern = [
            "W" if w.result == Player.Result.WIN else "D" for w in allData
        ]  # kan converti lista

        for i in range(len(pattern) - 1):
            if pattern[i : i + 2] == ["D", "D"]:  #  l9it joj li deconectaw

                if (
                    i > 0 and pattern[i - 1] == "W"
                ):  # la kan l winner 9bel dissconnected game
                    skipIndex.append(i - 1) 

                elif (
                    i + 2 < len(pattern) and pattern[i + 2] == "W"
                ):  # la kan l winner mn b3d dissconnected game
                    skipIndex.append(i + 2)
                else:
                    continue

                # kanakhed ga3 l allData ila li khshom yt skipaw
                activePlayers = [
                    w for w in allData
                    if w.result == Player.Result.WIN and allData.index(w) not in skipIndex
                ]
                return skipIndex, activePlayers
        return None, allData

    def createNextBracketGames(self, winners, allData, nextBrackeet):
        print("IMM in creaateNEXT BRACKKEET", flush=True)
        skipIndex = None
        playersToMatch = None
        print("UPDATED ALL DATA => ",allData, flush=True)
        if (len(winners)) % 2 != 0 :
            skipIndex, activePlayerss = self.PlayerSkip(allData)
            print("ACTIVEPLAYEEERS : ", activePlayerss, flush=True)
        if skipIndex is not None:
            for element in skipIndex:
                try:
                    print("IM BEING SKIPPED ", allData[element].user.username, flush=True)
                except:
                    print("PRINT KHSRAAT", flush=True)
            # khona li khso ytskipa (hadi bach ntfker nzid skipp player f player model)
                skippingPlayer = allData[element]
                skippingPlayer.should_skip_next = True
                skippingPlayer.save()
                self.send_game_notif(skippingPlayer.user, message = "You've been skipped to next bracket, wait a while ...")
                playersToMatch = activePlayerss
        else:
            playersToMatch = winners
    
        print("PLAYERS TO MATCH : \n",len(playersToMatch), flush=True)
        # kan creati l games normally
        for i in range(0, len(playersToMatch), 2):
            if i + 1 < len(playersToMatch):
                self.create_game_pair(
                    [playersToMatch[i].user, playersToMatch[i + 1].user], nextBrackeet
                )


