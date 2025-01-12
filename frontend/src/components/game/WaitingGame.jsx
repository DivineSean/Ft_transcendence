import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";
import { BACKENDURL } from "../../utils/fetchWrapper.js";

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
        ? `${BACKENDURL}${player.user.profile_image}?t=${new Date().getTime()}`
        : "/images/default.jpeg",
      status: player.ready ? "Accepted" : "Pending",
      statusClass: player.ready ? "text-emerald-400" : "text-red",
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
            "The match was either not accepted in time or was declined. You have been removed from the queue.",
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
      <div className="primary-glass lg:w-[60%] md:w-[80%] w-[95%] flex flex-col relative overflow-hidden p-8 md:p-16 lg:p-32 rounded-2xl border border-white/10">
        <h1 className="text-center text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-6 md:mb-8">
          Match Found
        </h1>

        {/* Progress Bars */}
        <div className="absolute w-full md:h-4 h-2 bg-black/30 backdrop-blur-sm top-0 left-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all duration-50"
            style={{ width: `${topWidth}%` }}
          ></div>
        </div>
        <div className="absolute h-full md:w-4 w-2 bg-black/30 backdrop-blur-sm top-0 right-0">
          <div
            className="w-full bg-gradient-to-b from-emerald-400 to-blue-500 transition-all duration-50"
            style={{ height: `${rightWidth}%` }}
          ></div>
        </div>
        <div className="absolute w-full md:h-4 h-2 bg-black/30 backdrop-blur-sm bottom-0 left-0 rotate-180">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all duration-50"
            style={{ width: `${bottomWidth}%` }}
          ></div>
        </div>
        <div className="absolute h-full md:w-4 w-2 bg-black/30 backdrop-blur-sm top-0 left-0 rotate-180">
          <div
            className="w-full bg-gradient-to-b from-emerald-400 to-blue-500 transition-all duration-50"
            style={{ height: `${leftWidth}%` }}
          ></div>
        </div>

        <div className="flex flex-col gap-8 md:gap-16">
          <div className="flex md:gap-32 gap-8 items-center justify-center">
            <PlayerInfo player={meInfo} />
            <div className="font-bold uppercase text-emerald-400/80 md:text-4xl text-xl">
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
      <div className="w-24 h-24 md:w-48 lg:w-64 md:h-48 lg:h-64 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-emerald-400/50 transition-all duration-300">
        <img
          src={player.profileImage}
          className="object-cover w-full h-full"
          alt={`@${player.username}`}
        />
      </div>
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-0.5 md:px-4 md:py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
        <h2 className={`text-xs md:text-sm font-medium ${player.statusClass}`}>
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
  <div className="flex items-center justify-center flex-wrap gap-3 md:gap-6">
    <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
      <h2 className="text-xs md:text-sm text-white font-medium">{game} Game</h2>
    </span>
    <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-emerald-400/10 backdrop-blur-sm border border-emerald-400/20">
      {flag !== 0 ? (
        <span className="text-xs md:text-sm text-emerald-400 font-medium">
          Ranked Match
        </span>
      ) : (
        <span className="text-xs md:text-sm text-emerald-400 font-medium">
          Normal Match
        </span>
      )}
    </span>
    <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-blue-400/10 backdrop-blur-sm border border-blue-400/20">
      <span className="text-xs md:text-sm text-blue-400 font-medium">1v1</span>
    </span>
  </div>
);

const RatingInformation = ({ data, me }) => (
  <div className="flex justify-center items-center gap-4 md:gap-8 mt-6 md:mt-8">
    <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg">
      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
      <span className="text-xs md:text-sm text-white/80">Victory</span>
      <span className="text-sm md:text-base font-bold text-emerald-400">
        +{data.players[me].rating_gain}
      </span>
    </div>
    <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg">
      <div className="w-2 h-2 rounded-full bg-red"></div>
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
      className="primary-glass py-2 md:py-4 px-8 md:px-16 lg:px-32 transition-all flex justify-center items-center hover:bg-emerald-400/20 rounded-md text-emerald-400 font-semibold border border-emerald-400/20"
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
      className="primary-glass py-2 md:py-4 px-8 md:px-16 lg:px-32 transition-all flex justify-center items-center hover:bg-red/20 rounded-md text-red font-semibold border border-red/20"
    >
      Decline
    </button>
  </div>
);

export default WaitingGame;
