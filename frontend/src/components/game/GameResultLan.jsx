import { BACKENDURL } from "../../utils/fetchWrapper";
import { useNavigate } from "react-router-dom";

const GameResultLan = ({ playersData, isWon}) => {

    const navigate = useNavigate();
    const winner = isWon ? playersData[0] : playersData[1];
    const loser = isWon ? playersData[1] : playersData[0];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center overflow-hidden px-16">
      <div className="relative w-full max-w-xl">
        <div className="flex flex-col items-center gap-16">
          {[winner, loser].map((player, index) => {
            const isWinner = index === 0;
            return (
              <div
                key={player.user.username}
                className={`w-full rounded-lg p-6 backdrop-blur-md ${
                  isWinner
                    ? "bg-green/10 border border-green/20"
                    : "bg-red/10 border border-red/20"
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div
                      className={`w-20 h-20 rounded-full overflow-hidden border-2 ${
                        isWinner ? "border-green" : "border-red"
                      }`}
                    >
                      <img
                        src={
                          player.user.profile_image
                            ? `${BACKENDURL}${player.user.profile_image}`
                            : "/images/default.jpeg"
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isWinner && (
                      <div className="w-16 h-16 md:w-48 md:h-48 absolute z-10 flex justify-center items-center -bottom-2 -right-4 md:-bottom-8 md:-right-16 animate-bounce">
                        <img
                          src="/images/badges/victoryBadge.png"
                          alt="victory badge"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2
                      className={`text-lg md:text-xl font-bold ${
                        isWinner ? "text-green" : "text-red"
                      }`}
                    >
                      @{player.user.username}
                    </h2>
                  </div>
                  <div className="w-20 h-20">
                    <img
                      src={isWinner ? "/images/eto.gif" : "/images/bmo.gif"}
                      alt="Result Animation"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex gap-8">
            <button
              onClick={() => navigate(-1)}
              className="secondary-glass grow lg:w-full p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate("/home/")}
              className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide"
            >
              Quit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameResultLan;
