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
  const [isOpen, setIsOpen] = useState(false);
  const games = ["pong"];

  return (
    <div className="flex items-center gap-6 mb-8">
      <div className="flex items-center gap-4">
        {/* Animated Game controller icon with glow effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full animate-pulse"></div>
          <svg 
            className="relative w-7 h-7 text-emerald-400"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z"/>
            <circle cx="17" cy="12" r="1" fill="currentColor"/>
            <circle cx="14" cy="12" r="1" fill="currentColor"/>
            <path d="M8 10v4M6 12h4"/>
          </svg>
        </div>
        
        <div>
          <span className="block text-emerald-500 text-xs font-bold tracking-[0.2em] mb-1">GAME RANKED</span>
          <label className="block text-white text-2xl font-bold">
            Select Game
          </label>
        </div>
      </div>

      <div className="relative min-w-[300px]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full bg-black/30 hover:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/30 text-white py-4 px-6 transition-all duration-300"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/50 rounded-l-2xl"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-lg font-semibold tracking-wide capitalize">{currentGame}</span>
            </div>
            <svg 
              className={`w-5 h-5 text-emerald-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor"
              strokeWidth="2.5" 
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-black/30 backdrop-blur-xl border border-emerald-500/20 rounded-2xl shadow-lg shadow-emerald-500/10">
            {games.map(game => (
              <button
                key={game}
                onClick={() => {
                  onGameChange(game);
                  setIsOpen(false);
                }}
                className="relative w-full px-6 py-4 text-white hover:bg-emerald-500/10 transition-all duration-200 group"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/0 group-hover:bg-emerald-500/50 transition-all duration-200"/>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500/0 group-hover:bg-emerald-500 transition-all duration-200 rounded-full"/>
                  <span className="text-lg font-semibold tracking-wide capitalize">{game}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
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