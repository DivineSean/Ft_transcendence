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

def processGameResult(game_room_id):
    try:
        game_room = GameRoom.objects.select_related("bracket__tournament").get(
            id=game_room_id
        )

    except:
        return "No Tournament"
    if not game_room.bracket:
        return "Not a tournament game"

    manager = TournamentManager(game_room.bracket.tournament.id)
    manager.handle_game_completion(game_room_id)


def manageTournament(tournament_id):

    manager = TournamentManager(tournament_id)
    manager.initialize_matches()


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

            random.shuffle(players)

            role = 1
            for player in players:
                player.role = role
                player.save()
                role += 1

            for i in range(0, len(players), 2):
                if i + 1 < len(players):
                    self.create_game_pair(
                        [players[i].user, players[i + 1].user], current_bracket
                    )
        except Exception as e:
            pass

    def create_game_pair(self, users, bracket, message=None):

        data = {
            "game": self.tournament.game.id,
            "bracket": bracket.id,
            "players": [
                {"user": users[0].id, "role": 1},
                {"user": users[1].id, "role": 2},
            ],
        }
        serializer = GameRoomSerializer(data=data)

        if serializer.is_valid():
            game_room = serializer.create(serializer.validated_data)
            mark_game_room_as_expired.apply_async(
                args=[game_room.id], countdown=GAME_EXPIRATION
            )

            self.notify_players(users, game_room, message=message)
        else:
            pass

    def notify_players(self, users, game_room, message=None):
        for user in users:
            self.send_game_notif(user, game_room.id, message)

    def send_game_notif(self, receiver, game_room_id=None, message=None):

        notif_data = {
            "notifType": "IT",
            "userId": receiver,
            "senderId": self.tournament.creator,
            "game": self.tournament.game.name,
            "senderUsername": self.tournament.creator.username,
        }

        if message is not None:
            notif_data["notifMessage"] = message
        if game_room_id is not None:
            notif_data["targetId"] = str(game_room_id)

        notification = Notifications.objects.create(**notif_data)
        notification.updateRead()
        group_name = f"notifications_{receiver.id}"
        self._send_ws_notification(group_name)

    def _send_ws_notification(self, group_name, messsage=None):
        async_to_sync(self.channel_layer.group_send)(
            group_name,
            {
                "type": "send_tournament_notification",
                "sender": str(self.tournament.creator.id),
                "sender_username": self.tournament.creator.username,
            },
        )

    def handle_game_completion(self, gameRoomID):
        game_room = GameRoom.objects.select_related("bracket").get(id=gameRoomID)
        current_bracket = game_room.bracket

        if current_bracket.isComplete():
            lock = r.lock(f"bracket_data:{current_bracket.id}:lock", timeout=10)
            if not lock.acquire(blocking=False):
                return

            winners, allData = current_bracket.getWinners()

            skippedPlayerss = Player.objects.filter(
                game_room__bracket__round_number=current_bracket.round_number - 1,
                should_skip_next=True,
            ).select_related("user")

            winners = winners + list(skippedPlayerss)

            if len(winners) == 0:
                self.tournament.refresh_from_db()
                self.tournament.isCanceled = True
                self.tournament.save()
                return
            elif len(winners) == 1:
                self.tournament.refresh_from_db()
                self.tournament.winner = winners[0].user
                self.tournament.isCompleted = True
                self.tournament.save()
                return
            if len(winners) % 2 == 1:
                nextBrackeet = self.tournament.advanceRound(len(winners) + 1)
            else:
                nextBrackeet = self.tournament.advanceRound(len(winners))

            if nextBrackeet:
                self.createNextBracketGames(winners, allData, nextBrackeet)

    def createActivePlayers(self, allData, skipIndex):
        return [
            w
            for w in allData
            if w.result == Player.Result.WIN and allData.index(w) not in skipIndex
        ]

    def PlayerSkip(self, allData):
        skipIndex = []
        pattern = ["W" if w.result == Player.Result.WIN else "D" for w in allData]

        for i in range(len(pattern) - 1):
            if pattern[i : i + 2] == ["D", "D"]:

                if i - 1 >= 0 and pattern[i - 1] == "W":
                    if i - 2 >= 0 and pattern[i - 2] == "W":
                        if i + 2 == len(allData):
                            skipIndex.append(i - 1)
                            activePlayers = self.createActivePlayers(allData, skipIndex)

                            return skipIndex, activePlayers
                    else:
                        skipIndex.append(i - 1)
                        activePlayers = self.createActivePlayers(allData, skipIndex)

                        return skipIndex, activePlayers

                if i + 2 < len(pattern) and pattern[i + 2] == "W":
                    skipIndex.append(i + 2)
                else:
                    continue

                activePlayers = self.createActivePlayers(allData, skipIndex)
                return skipIndex, activePlayers
        return None, allData

    def createNextBracketGames(self, winners, allData, nextBrackeet):
        skipIndex = None
        playersToMatch = None
        if (len(winners)) % 2 != 0:
            skipIndex, activePlayerss = self.PlayerSkip(allData)
        if skipIndex is not None:
            for element in skipIndex:
                skippingPlayer = allData[element]
                skippingPlayer.should_skip_next = True
                skippingPlayer.save()
                self.send_game_notif(
                    skippingPlayer.user,
                    message="You've been skipped to the next round!",
                )
                playersToMatch = activePlayerss
        else:
            playersToMatch = winners
        if nextBrackeet.round_number == self.tournament.total_rounds:
            message = "You're in the final round!"
        else:
            message = f"You're in round {nextBrackeet.round_number}!"
        for i in range(0, len(playersToMatch), 2):
            if i + 1 < len(playersToMatch):
                self.create_game_pair(
                    [playersToMatch[i].user, playersToMatch[i + 1].user],
                    nextBrackeet,
                    message,
                )
