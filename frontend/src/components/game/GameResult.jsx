import React, { useContext } from "react";
import UserContext from "../../context/UserContext";
import { BACKENDURL } from "../../utils/fetchWrapper";
import { useNavigate } from "react-router-dom";
import { LiaTrophySolid } from "react-icons/lia";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";

const GameResult = ({ playersData, isWon }) => {
  const navigate = useNavigate();
  const userContextData = useContext(UserContext);
  const me =
    userContextData.userInfo.username !== playersData[0].user.username ? 1 : 0;
  const ratingChangeW = playersData[me].rating_gain;
  const ratingChangeL = playersData[me].rating_loss;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center overflow-hidden px-16">
      <div className="relative w-full max-w-xl">
        <div className={`flex flex-col items-center gap-16`}>
          <div
            className={`rounded-full p-8 flex ${
              isWon
                ? "bg-green/20 text-green border border-green/50"
                : "bg-red/20 text-red"
            }`}
          >
            {isWon ? (
              <LiaTrophySolid className="text-txt-5xl" />
            ) : (
              <IoIosCloseCircleOutline className="text-txt-5xl" />
            )}
          </div>

          <h1
            className={`text-4xl md:text-6xl font-black mb-2 ${
              isWon ? "text-green" : "text-red"
            }`}
          >
            {isWon ? "VICTORY" : "DEFEAT"}
          </h1>
          <div
            className={`w-full mt-8 rounded-xl p-6 backdrop-blur-md ${
              isWon
                ? "bg-green/10 border border-green/20"
                : "bg-red/10 border border-red/20"
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full overflow-hidden border-2 ${
                    isWon ? "border-green" : "border-red"
                  }`}
                >
                  <img
                    src={
                      playersData[me].user.profile_image
                        ? `${BACKENDURL}${playersData[me].user.profile_image}`
                        : "/images/default.jpeg"
                    }
                    alt=""
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
                {isWon && (
                  <div className="w-16 h-16 md:w-48 md:h-48 absolute z-10 flex justify-center items-center -bottom-2 -right-4 md:-bottom-8 md:-right-16 animate-bounce">
                    <img
                      src="/images/badges/victoryBadge.png"
                      alt="victory badge"
                      className="object-cover drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2
                  className={`text-lg md:text-xl font-bold ${
                    isWon ? "text-green" : "text-red"
                  }`}
                >
                  @{playersData[me].user.username}
                </h2>
                {(ratingChangeW > 0 || ratingChangeL > 0) && (
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      isWon ? "text-green" : "text-red"
                    }`}
                  >
                    {isWon ? (
                      <LuTrendingUp size={16} />
                    ) : (
                      <LuTrendingDown size={16} />
                    )}
                    <span className="font-medium text-sm">
                      {isWon ? `+${ratingChangeW}` : `-${ratingChangeL}`} RP
                    </span>
                  </div>
                )}
              </div>
              <div className="w-20 h-20">
                <img
                  src={isWon ? "/images/eto.gif" : "/images/bmo.gif"}
                  alt="Result Animation"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/games/pong/online/")}
            className={`
              secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center
               rounded-md font-semibold tracking-wide
              ${
                isWon
                  ? "hover:bg-green/60 hover:text-black text-green"
                  : "hover:bg-red/60 hover:text-white text-red"
              }`}
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResult;
