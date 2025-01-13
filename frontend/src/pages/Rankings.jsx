import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import UserContext from "../context/UserContext";

const RankedUsers = ({ rank, username, demote, rating, promote, lvl, ranked }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/overview/${username}`);
  };

  return (
    <div className="grid lg:grid-cols-5 grid-cols-4 gap-32 text-center items-center hover:bg-white/5 rounded-lg py-2 transition-all duration-200">
      <p>{rank}</p>
      <p className="cursor-pointer hover:text-green transition-colors duration-200" onClick={handleProfileClick}>{username.length > 10 ? `${username.substring(0, 10)}...` : username}</p>
      <p className="hidden lg:block cursor-pointer hover:text-green transition-colors duration-200" onClick={handleProfileClick}>{lvl}</p>
      <p className="lg:block hidden cursor-pointer hover:text-green transition-colors duration-200" onClick={handleProfileClick}>
        {demote}/{rating}/{promote}
      </p>
      <p className="lg:hidden block">{rating}</p>
      <p className="cursor-pointer hover:text-green transition-colors duration-200" onClick={handleProfileClick}>{ranked}</p>
    </div>
  );
};


const TopThreePlayers = ({ players }) => {
  const navigate = useNavigate();
  const visualOrder = [1, 0, 2];
  const heights = ["h-[120px]", "h-[160px]", "h-[80px]"];
  const imgSizes = [
    "md:w-[80px] md:h-[80px] w-[56px] h-[56px]",
    "md:w-[96px] w-[64px] md:h-[96px] h-[64px]",
    "md:w-[80px] w-[56px] md:h-[80px] h-[56px]"
  ];
  const textSizes = [
    "text-h-lg-2xl",
    "text-h-lg-4xl text-green",
    "text-h-lg-xl"
  ];

  const handleProfileClick = (username) => {
    navigate(`/profile/overview/${username}`);
  };

  return (
    <div className="grid grid-cols-3 md:gap-32 gap-16 items-end justify-center lg:px-64 md:px-16 px-8">
      {visualOrder.map((playerIndex, visualIndex) => {
        const player = players[playerIndex];
        if (!player) return null;

        return (
          <div key={playerIndex} className="flex flex-col gap-16">
            <div 
              className="flex flex-col items-center gap-8 cursor-pointer" 
              onClick={() => handleProfileClick(player.username)}
            >
              <img
                src={player.profile_image || "/images/default.jpeg"}
                className={`${imgSizes[visualIndex]} object-cover grow rounded-full`}
                alt={player.username}
                draggable="false"
              />
              <h2 className={visualIndex === 1 ? "md:text-txt-md text-txt-xs" : "text-txt-xs"}>
                {player.username}
              </h2>
            </div>
            <div className={`${heights[visualIndex]} bg-[url('/images/background.png')] bg-top bg-cover norepeat overflow-hidden relative flex justify-center items-center rounded-t-lg`}>
              <div className="absolute hover-secondary backdrop-blur-2xl w-full h-full"></div>
              <p className={`${textSizes[visualIndex]} font-bold z-10`}>{player.rank}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const GameSelector = ({ currentGame, onGameChange }) => {
  const games = ["pong"];

  return (
    <>
    <label className="text-white mb-4">Games:</label>
    <div className="flex justify-start mb-8">
      <select 
        value={currentGame} 
        onChange={(e) => onGameChange(e.target.value)}
        className="bg-black/10 backdrop-blur rounded-lg border border-white/10 hover:border-white/20 text-white font-medium text-md py-2 px-4 pr-8 cursor-pointer focus:outline-none"
      >
        {games.map(game => (
          <option key={game} value={game} className="bg-black/10 text-white">
            {game}
          </option>
        ))}
      </select>
    </div>
    </>
  );
};


const Rankings = () => {

  const { Rankings, get_rankings } = useContext(UserContext);
  const [selectedGame, setSelectedGame] = useState("pong");

  useEffect(() => {
    get_rankings(selectedGame);

  }, [selectedGame]);

  if (!Rankings || !Rankings.rankings) {
    return (
      <div className="flex flex-col grow lg:gap-20 gap-12">
        <Header link="rankings" />
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="primary-glass grow flex flex-col justify-center items-center md:p-20 p-8 rounded-lg shadow-lg">
            <p className="text-center text-xl font-semibold text-gray-700 animate-pulse">
              Nobody Has Been Ranking Yet...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentUserRank = Rankings.rankings.find(player => player.is_self);
  const otherPlayers = Rankings.rankings.filter(player => !player.is_self && !Rankings.rankings.slice(0, 3).includes(player));

  return (
    <div className="flex flex-col grow lg:gap-32 gap-16">
      <Header link="rankings" />
        <div className="container md:px-16 px-0">
          <div style={{ height: 'calc(100vh - 116px)'}} className="primary-glass grow flex flex-col md:p-32 p-16 gap-16 ">
            <div className="flex flex-col overflow-hidden">
              <GameSelector 

                currentGame={selectedGame} 
                onGameChange={setSelectedGame}
              />
              
              <TopThreePlayers players={Rankings.rankings.slice(0, 3)} />
              
              <div className="bg-[url('/images/background.png')] relative flex flex-col p-32 gap-8 overflow-hidden rounded-md bg-cover bg-center bg-fixed mt-16">
                <div className="absolute w-full h-full secondary-glass top-0 left-0"></div>
                  {currentUserRank && (
                    <>
                      <h3 className="text-white/60 font-medium z-10">Your Ranking</h3>
                      <div className="grid lg:grid-cols-5 grid-cols-4 gap-32 hover-secondary rounded-lg text-center py-4 z-10">
                        <p>{currentUserRank.rank}</p>
                        <p className="font-bold">you</p>
                        <p className="hidden lg:block">{currentUserRank.exp}</p>
                        <p className="lg:block hidden">{currentUserRank.demote}/{currentUserRank.rating}/{currentUserRank.promote}</p>
                        <p className="lg:hidden block">{currentUserRank.rating}</p>
                        <p>{currentUserRank.ranked}</p>
                      </div>
                      <div className="h-[0.5px] bg-stroke-sc mt-4"></div>
                    </>
                  )}

                  <div className="grid lg:grid-cols-5 grid-cols-4 gap-32 text-center font-bold py-4 z-10">
                    <p>Rank</p>
                    <p>Player</p>
                    <p className="hidden lg:block">Account Level</p>
                    <p className="lg:block hidden">
                      <span title="Demote">D/</span>
                      <span title="MMR">M/</span>
                      <span title="Promote">P</span>
                    </p>
                    <p className="lg:hidden block">
                      <span>MMR</span>
                    </p>
                    <p>Elo</p>
                  </div>

                  <div className="h-[0.5px] bg-stroke-sc"></div>

                  <div className="flex flex-col gap-2 overflow-y-scroll no-scrollbar z-10">
                    {otherPlayers.map((player) => (
                      <RankedUsers
                        key={player.user_id}
                        rank={player.rank}
                        username={player.username}
                        demote={player.demote}
                        rating={player.rating}
                        promote={player.promote}
                        lvl={player.exp}
                        ranked={player.ranked}
                      />
                    ))}
                  </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Rankings;