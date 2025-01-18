import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";
import { BACKENDURL } from "../../utils/fetchWrapper.js";
import { GiSandsOfTime } from "react-icons/gi";
import { GoVerified } from "react-icons/go";

const WaitingGame = ({ data, send, game, decline, setGlobalMessage }) => {
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);

  const me = userInfo.username === data.players[0].user.username ? 0 : 1;
  const other = me === 0 ? 1 : 0;

  const playerInfo = (playerIndex) => {
    const player = data.players[playerIndex];
    return {
      username: player.user.username,
      profileImage: player.user.profile_image
        ? `${BACKENDURL}${player.user.profile_image}`
        : "/images/default.jpeg",
      status: player.ready ? <GoVerified className="text-txt-xl"/> : <GiSandsOfTime className="text-txt-xl"/>,
      statusClass: player.ready ? "text-green" : "text-red",
    };
  };

  const meInfo = playerInfo(me);
  const otherInfo = playerInfo(other);

  // Timer setup
  const endTime = new Date(data.created_at).getTime() + 60 * 1000;
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      const remainingTime = endTime - Date.now();
      setTimeLeft(Math.max(remainingTime, 0));

      if (remainingTime <= 0 || decline === "yes") {
        setGlobalMessage({
          message:
            "Match not accepted or declined. You've been removed from the queue.",
          isError: true,
        });
        navigate(`/games/${game}/online`);
      }
    }, 60);

    return () => clearInterval(intervalId);
  }, [endTime, navigate, game, decline]);

  const timePercentage = 100 - (timeLeft / (60 * 1000)) * 100;

  const calculateSegmentWidth = (start, end) => {
    if (timePercentage <= start) return 0;
    const progress = (timePercentage - start) / (end - start);
    return Math.min(progress * 100, 100);
  };

  const topWidth = timePercentage >= 25 ? 100 : calculateSegmentWidth(0, 25);
  const rightWidth = timePercentage >= 50 ? 100 : calculateSegmentWidth(25, 50);
  const bottomWidth =
    timePercentage >= 75 ? 100 : calculateSegmentWidth(50, 75);
  const leftWidth =
    timePercentage >= 100 ? 100 : calculateSegmentWidth(75, 100);

  return (
    <div className="bg-black/50 backdrop-blur-sm absolute top-0 left-0 flex justify-center items-center w-full h-full">
      <div className="primary-glass lg:w-[60%] md:w-[80%] w-[95%] lg:flex lg:flex-col relative overflow-hidden p-16 lg:p-32 rounded-2xl border border-stroke-sc gap-8 md:gap-32">
        <div className="flex justify-center">
          <h1 className="text-center text-2xl md:text-4xl font-bold bg-gradient-to-l from-green to-red bg-clip-text text-transparent mb-6 ">
            Match Found
          </h1>
        </div>

        {/* Progress Bars */}
        <div className="absolute w-full md:h-4 h-2 bg-black/30 backdrop-blur-sm top-0 left-0">
          <div
            className="h-full bg-gradient-to-r from-green/80 to-green/70 transition-all duration-50"
            style={{ width: `${topWidth}%` }}
          ></div>
        </div>
        <div className="absolute h-full md:w-4 w-2 bg-black/30 backdrop-blur-sm top-0 right-0">
          <div
            className="w-full bg-gradient-to-b from-green/70 to-green/50 transition-all duration-50"
            style={{ height: `${rightWidth}%` }}
          ></div>
        </div>
        <div className="absolute w-full md:h-4 h-2 bg-black/30 backdrop-blur-sm bottom-0 left-0 rotate-180">
          <div
            className="h-full bg-gradient-to-l from-red/50 to-green/50 transition-all duration-50"
            style={{ width: `${bottomWidth}%` }}
          ></div>
        </div>
        <div className="absolute h-full md:w-4 w-2 bg-black/30 backdrop-blur-sm top-0 left-0 rotate-180">
          <div
            className="w-full bg-gradient-to-t from-red/90 to-red/50 transition-all duration-50"
            style={{ height: `${leftWidth}%` }}
          ></div>
        </div>

        <div className="flex flex-col gap-8 md:gap-32">
          <div className="flex md:gap-32 gap-8 items-center justify-center">
            <PlayerInfo player={meInfo} />
            <div className="font-bold uppercase text-green/80 md:text-4xl text-xl">
              vs
            </div>
            <PlayerInfo player={otherInfo} />
          </div>
          <GameInfo game={game} flag={data.players[me].rating_gain} />
        </div>

        {data.players[me].rating_gain !== 0 && (
          <RatingInformation data={data} me={me} />
        )}
        <ActionButtons game={game} send={send} navigate={navigate} />
      </div>
    </div>
  );
};

const PlayerInfo = ({ player }) => (
  <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
    <div className="relative group">
      <div className="w-48 h-48 md:w-48 lg:w-64 md:h-48 lg:h-64 rounded-full overflow-hidden
        border-2 border-stroke-sc group-hover:border-green/50 transition-all duration-300">
        <img
          src={player.profileImage}
          className="object-cover w-full h-full"
          alt={`@${player.username}`}
        />
      </div>
      <div className="absolute -bottom-4 -right-4 p-4 rounded-full bg-black/80 backdrop-blur-lg border border-stroke-sc">
        <h2 className={`text-xs md:text-sm ${player.statusClass}`}>
          {player.status}
        </h2>
      </div>
    </div>
    <div className="flex flex-col items-center">
      <h2 className="font-bold tracking-wider text-lg md:text-2xl text-white">
        @{player.username}
      </h2>
    </div>
  </div>
);

const GameInfo = ({ game, flag }) => (
  <div className="flex items-center justify-center flex-wrap gap-16">
    <span className="px-8 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-stroke-sc">
      <span className="text-xs md:text-sm text-white">{game} Game</span>
    </span>
    <span className="px-8 p-4 rounded-lg bg-green/10 backdrop-blur-sm border border-stroke-sc">
      {flag !== 0 ? (
        <span className="text-xs md:text-sm text-green">
          Ranked Match
        </span>
      ) : (
        <span className="text-xs md:text-sm text-green">
          Normal Match
        </span>
      )}
    </span>
    <span className="px-8 p-4 rounded-lg bg-green/10 backdrop-blur-sm border border-green/20">
      <span className="text-xs md:text-sm text-green">1v1</span>
    </span>
  </div>
);

const RatingInformation = ({ data, me }) => (
  <div className="flex justify-center items-center gap-16">
    <div className="flex items-center gap-8 bg-black/40 p-8 px-16 rounded-lg">
      <div className="w-2 h-2 rounded-lg bg-green"></div>
      <span className="text-xs md:text-sm text-white/80">Victory</span>
      <span className="text-sm md:text-base font-bold text-green">
        +{data.players[me].rating_gain}
      </span>
    </div>
    <div className="flex items-center gap-8 bg-black/40 p-8 px-16 rounded-lg">
      <div className="w-2 h-2 rounded-lg bg-red"></div>
      <span className="text-xs md:text-sm text-white/80">Defeat</span>
      <span className="text-sm md:text-base font-bold text-red">
        -{data.players[me].rating_loss}
      </span>
    </div>
  </div>
);

const ActionButtons = ({ game, send, navigate }) => (
  <div className="flex gap-4 md:gap-8 justify-center mt-6 md:mt-8">
    <button
      onClick={() => {
        send(
          JSON.stringify({
            type: "ready",
            message: {},
          }),
        );
      }}
      className="secondary-glass p-8 px-32 transition-all flex gap-4 justify-center items-center
               rounded-md font-semibold tracking-wide hover:bg-green/60 hover:text-black text-green"
    >
      Accept
    </button>
    <button
      onClick={() => {
        send(
          JSON.stringify({
            type: "notready",
            message: {},
          }),
        );
      }}
      className="secondary-glass p-8 px-16 transition-all flex gap-4 justify-center items-center
               rounded-md font-semibold tracking-wide hover:bg-red/60 hover:text-white text-red"
    >
      Decline
    </button>
  </div>
);

export default WaitingGame;
