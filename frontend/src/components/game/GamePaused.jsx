import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const GamePaused = ({ game, image, isS, isRanked }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(28);
  const [isQuitConfirmed, setIsQuitConfirmed] = useState(false);
  console.log("isRanked", isRanked);
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown === 1) {
          clearInterval(timer);
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleQuitClick = () => {
    if (isS || countdown <= 0 || isRanked === 0) navigate(`/games/${game}/online`);
    else setIsQuitConfirmed(true);
  };

  const handleConfirmQuit = () => {
    navigate(`/games/${game}/online`);
  };

  const handleCancelQuit = () => {
    setIsQuitConfirmed(false);
  };

  return (
    <div className="bg-black/50 absolute top-0 left-0 flex justify-center items-center w-full h-full overflow-y-auto no-scroll">
      <div className="container h-full flex justify-center items-center">
        <div className="primary-glass rounded-lg lg:w-full w-[70%] lg:h-[50%] h-[70%] lg:grid flex lg:grid-cols-[1fr_520px] overflow-hidden gap-16 items-center justify-center">
          <div className="p-16 flex flex-col gap-32 h-full justify-center items-center">
            <h1 className="font-bold text-h-lg-lg">
              {game} game {countdown > 0 ? "Paused" : "Completed"}
            </h1>
            <div className="normal-case tracking-wider text-center">
              {isS ? (
                <p>
                  One of the players has been disconnected
                  {countdown > 0 ? (
                    <>
                      <br />
                      The game will be forfeited in: {countdown} seconds
                      <br />
                      <strong className="text-red">
                      Unless the player reconnects
                      </strong>
                    </>
                  ) : (
                    <>
                      <br />
                      Game over. The player has been penalized with a rating deduction
                      <br />
                      <strong className="text-red">
                      Unfortunately, the AFK player did not reconnect.
                      </strong>
                    </>
                  )}
                </p>
              ) : (
                <p>
                  {countdown > 0 ? (
                    <>
                      Reconnection pending... Please wait for your opponent to reconnect in: {" "}
                      {countdown}s
                      <br />
                          <strong className="text-red">Warning!</strong> If you leave now, you can't join another game until this game expires.
                    </>
                  ) : (
                    "You're Patient been rewarded, Congratulations You Won!"
                  )}
                </p>
              )}
            </div>
              <div className="flex gap-16">
                <button
                  onClick={handleQuitClick}
                  className="secondary-glass p-8 px-16 transition-all flex gap-4 justify-center items-center
                hover:bg-red-600 hover:text-black rounded-md text-red-600 font-semibold tracking-wide"
                >
                  Quit Game
                </button>
              </div>
          </div>
          <div
            style={{ backgroundImage: `url(${image})` }}
            className="h-full bg-cover bg-center relative"
          >
            <div className="absolute top-0 left-0 h-full w-full cover-gradient"></div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for quitting */}
      {isQuitConfirmed && countdown > 0 && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black/60">
          <div className="primary-glass p-8 rounded-md flex flex-col items-center">
            <h3 className="font-semibold text-xl mb-4">
              Are you sure you want to quit?
            </h3>
            <p className="text-center mb-4">
              You'll lose your rating if your opponent returns in time.
            </p>
            <div className="flex gap-8">
              <button
                onClick={handleConfirmQuit}
                className="secondary-glass p-8 px-16 transition-all flex justify-center items-center
                  hover:bg-red-600 hover:text-black rounded-md text-red-600 font-semibold tracking-wide"
              >
                Yes, Quit
              </button>
              <button
                onClick={handleCancelQuit}
                className="secondary-glass p-8 px-16 transition-all flex justify-center items-center
                  hover:bg-gray-600 hover:text-black rounded-md text-gray-600 font-semibold tracking-wide"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePaused;
