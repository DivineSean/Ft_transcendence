import React, { useContext } from "react";
import UserContext from "../../context/UserContext";
import { BACKENDURL } from "../../utils/fetchWrapper";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Trophy, XCircle } from "lucide-react";

const GameResult = ({ playersData, isWon }) => {
  const navigate = useNavigate();
  const userContextData = useContext(UserContext);
  const me =
    userContextData.userInfo.username !== playersData[0].user.username ? 1 : 0;
  const ratingChangeW = playersData[me].rating_gain;
  const ratingChangeL = playersData[me].rating_loss;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-black to-gray-900 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,128,128,0.1),rgba(0,0,0,0))]" />
      <div className="relative w-full max-w-xl mx-4 z-10">
        <div
          className={`flex flex-col items-center transform ${isWon ? "scale-100" : "scale-95"} transition-all duration-500`}
        >
          <div
            className={`rounded-full p-4 mb-6 ${
              isWon
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-rose-500/20 text-rose-400"
            }`}
          >
            {isWon ? <Trophy size={40} /> : <XCircle size={40} />}
          </div>

          <h1
            className={`text-4xl md:text-6xl font-black mb-2 ${
              isWon ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isWon ? "VICTORY" : "DEFEAT"}
          </h1>
          <div
            className={`w-full mt-8 rounded-xl p-6 backdrop-blur-md ${
              isWon
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-rose-500/10 border border-rose-500/20"
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full overflow-hidden border-2 ${
                    isWon ? "border-emerald-500" : "border-rose-500"
                  }`}
                >
                  <img
                    src={
                      playersData[me].user.profile_image
                        ? `${BACKENDURL}${playersData[me].user.profile_image}?t=${new Date().getTime()}`
                        : "/images/default.jpeg"
                    }
                    alt=""
                    className="w-full h-full object-cover"
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
                    isWon ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  @{playersData[me].user.username}
                </h2>
                {(ratingChangeW > 0 || ratingChangeL > 0) && (
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      isWon ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isWon ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
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
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/games/pong/online/")}
            className={`mt-8 px-8 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all 
              ${
                isWon
                  ? "bg-emerald-500 hover:bg-emerald-600 text-emerald-50"
                  : "bg-rose-500 hover:bg-rose-600 text-rose-50"
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
