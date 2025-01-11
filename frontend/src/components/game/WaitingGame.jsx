import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";
import { BACKENDURL } from "../../utils/fetchWrapper.js";

const CountdownTimer = ({ createdAt }) => {
  const endTime = new Date(createdAt).getTime() + 60 * 1000;
  const [count, setCount] = useState(endTime - Date.now());
  const [timeLeft, setTimeLeft] = useState(count);

  useEffect(() => {
    const updateTime = () => {
      const remainingTime = endTime - Date.now();
      if (remainingTime > 0) {
        setCount(Math.floor(remainingTime / 1000));
        setTimeLeft(remainingTime);
      } else {
        setCount(0);
        setTimeLeft(0);
      }
    };

    const intervalId = setInterval(updateTime, 50); // More frequent updates for smoother animation

    return () => clearInterval(intervalId);
  }, [endTime]);

  // Calculate the percentage of time left (reversed for fill effect)
  const timePercentage = 100 - ((timeLeft / (60 * 1000)) * 100);

  return (
    <div className="relative w-52 h-52 flex items-center justify-center">
      {/* Background circle */}
      <div className="absolute inset-0 rounded-lg bg-gray-200" />
      
      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `conic-gradient(
            from 0deg,
            #3b82f6 ${timePercentage}%,
            transparent ${timePercentage}%
          )`,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          padding: '4px',
          maskImage: 'linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor'
        }}
      >
        {/* Inner content container */}
        <div className="w-full h-full bg-white rounded-lg" />
      </div>

      {/* Timer display */}
      <div className="absolute text-3xl font-bold text-gray-800">
        {count > 0 ? count : 0}s
      </div>
    </div>
  );
};

const WaitingGame = ({ data, send, game }) => {
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
      statusClass: player.ready ? "text-green" : "text-red",
    };
  };

  const meInfo = playerInfo(me);
  const otherInfo = playerInfo(other);

  return (
    <div className="bg-black/50 absolute top-0 left-0 flex justify-center items-center w-full h-full">
      <div className="primary-glass lg:w-[60%] md:w-[80%] w-[90%] justify-center flex flex-col overflow-hidden p-16 md:p-32">

        <div className="flex flex-col gap-16">
          <div className="flex md:gap-32 gap-16 items-center justify-center">
            {/* Player 1 */}
            <div className="flex justify-center items-center gap-8 grow">
              <div className="md:w-64 md:h-64 w-40 h-40 bg-green flex rounded-full overflow-hidden border border-stroke-sc">
                <img src={meInfo.profileImage} className="object-cover" alt={`@${meInfo.username}`} />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="font-bold tracking-wider md:text-txl-md text-txt-xs">
                  @{meInfo.username}
                </h2>
                <h2 className={`tracking-wider md:text-txt-sm text-txt-xs ${meInfo.statusClass}`}>
                  {meInfo.status}
                </h2>
              </div>
            </div>

            {/* VS text */}
            <div className="font-bold uppercase text-green/80 md:text-h-lg-lg text-h-sm-sm">
              vs
            </div>

            {/* Player 2 */}
            <div className="flex justify-center items-center gap-8 grow">
              <div className="md:w-64 md:h-64 w-40 h-40 bg-green flex rounded-full overflow-hidden border border-stroke-sc">
                <img src={otherInfo.profileImage} className="object-cover" alt={`@${otherInfo.username}`} />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="font-bold tracking-wider md:text-txl-md text-txt-xs">
                  @{otherInfo.username}
                </h2>
                <h2 className={`tracking-wider md:text-txt-sm text-txt-xs ${otherInfo.statusClass}`}>
                  {otherInfo.status}
                </h2>
              </div>
            </div>
          </div>

          {/* Game Information */}
          <div className="font-semibold tracking-wider justify-center items-center flex gap-16">
            <div className="w-64 h-[1px] bg-gray"></div>
            <h2>{game} Game</h2>
            <div className="w-64 h-[1px] bg-gray"></div>
          </div>

          {/* Countdown Timer */}
          <div className="flex justify-center text-gray tracking-wide">
            GameExpire in : <CountdownTimer createdAt={data.created_at} />
          </div>
        </div>

        {/* Rating Information */}
        <div className="flex flex-col">
          <div className="flex justify-center items-center gap-8">
            <h2 className="font-semibold text-sm text-gray">Victory:</h2>
            <h1 className="font-bold text-xl text-green">+{data.players[me].rating_gain}</h1>
            <h2 className="font-semibold text-sm text-gray">Defeat:</h2>
            <h1 className="font-bold text-xl text-red">-{data.players[me].rating_loss}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-8 justify-center mt-8">
          <button
            onClick={() => {
              send(
                JSON.stringify({
                  type: "ready",
                  message: {},
                })
              );
            }}
            className="secondary-glass py-4 px-16 md:px-32 transition-all flex justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold"
          >
            Accept
          </button>
          <button
            onClick={() => navigate(`/games/${game}/online`)}
            className="secondary-glass py-4 px-16 md:px-32 transition-all flex justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingGame;
