import asyncio
from .models import Match
from time import sleep
class TournamentManager: 
    def __init__(self, lobby):
        self.matches = Match.objects.filter(lobby=lobby)
            

    async def syncNotifs(self):
        #maybe call consummer notifs not sure
        pass

    async def syncGames(self):
        #nwejdo game rooms then ok
        pass
    async def waitGame(self, time): 
        asyncio.sleep(time)