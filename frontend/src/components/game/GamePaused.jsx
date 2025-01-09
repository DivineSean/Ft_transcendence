import { useNavigate } from "react-router-dom";

// const GamePaused = ({ game }) => {
//   const navigate = useNavigate();

//   return (
//     <div className="bg-black/50 absolute top-0 left-0 flex justify-center items-center w-full h-full overflow-y-auto no-scroll">
//       <div className="container h-full flex justify-center items-center">
//         <div className="primary-glass lg:w-[60%] md:w-[80%] w-[90%] lg:h-[50%] h-[70%] lg:grid flex grid-cols-[1fr_420px] overflow-hidden gap-16 items-center justify-center">
//           <div className="p-16 flex flex-col gap-32 h-full justify-center items-center">
//             <h1 className="font-bold text-h-lg-lg">{game} game paused</h1>
//             <div className="flex flex-col gap-8 items-center normal-case tracking-wider">
//               <div>this game has been paused by the player</div>
//               <div>the game coming soon around 30s.</div>
//             </div>
//             <div className="flex flex-col gap-8 items-center">
//               <p className="font-light text-gray text-txt-sm tracking-wide">
//                 you decided to play another game?
//               </p>
//               <div className="flex ">
//                 <button
//                   onClick={() => navigate("/games/")}
//                   className="secondary-glass p-8 px-16 transition-all flex gap-4 justify-center items-center
// 										hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
//                 >
//                   play another game
//                 </button>
//               </div>
//             </div>
//           </div>
//           <div className="h-full bg-[url(/images/gamePaused.jpeg)] bg-cover bg-center relative">
//             <div className="absolute top-0 left-0 h-full w-full cover-gradient"></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import { useState, useEffect } from "react";

const GamePaused = ({ game, image, isS }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(28);
  const [isQuitConfirmed, setIsQuitConfirmed] = useState(false);

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
    if (isS)
      navigate("/games/");
    else
      setIsQuitConfirmed(true);
  };

  const handleConfirmQuit = () => {
    navigate("/games/");
  };

  const handleCancelQuit = () => {
    setIsQuitConfirmed(false);
  };

  return (
    <div className="bg-black/50 absolute top-0 left-0 flex justify-center items-center w-full h-full overflow-y-auto no-scroll">
      <div className="container h-full flex justify-center items-center">
        <div className="primary-glass w-full lg:h-[50%] h-[70%] lg:grid flex lg:grid-cols-[1fr_520px] overflow-hidden gap-16 items-center justify-center">
          <div className="p-16 flex flex-col gap-32 h-full justify-center items-center">
            <h1 className="font-bold text-h-lg-lg">{game} game {countdown > 0 ? "Paused": "Completed"}</h1>
            <div className="normal-case tracking-wider text-center">
              {isS ? 
              <p>One of the players Disconnected.
                {countdown > 0 ?
                  <>
                    <br />
                    The game is going to be forfeit in: {countdown}s
                    <br />
                    <strong className="text-red">Unless the player is back</strong>
                  </>
                    :
                  <>
                    <br />
                    The game is over, the player recieved a Rating Penalty
                    <br />
                    <strong className="text-red">Sadly The Player Didn't Make it!!</strong>
                  </>
                }
              </p>
              :
              <p>
                {countdown > 0 
                  ? (
                    <>
                      Please wait for the other player to reconnect in: {countdown}s
                      <br />
                      <strong className="text-red">Warning!</strong> If you leave now and the other player returns, you will lose your rating.
                    </>
                  )
                  : "You're Patient been rewarded, Congratulation You Won!"}
              </p>
              }        
            </div>
            {countdown > 0 && 
            <div className="flex gap-16">
              <button
                onClick={handleQuitClick}
                className="secondary-glass p-8 px-16 transition-all flex gap-4 justify-center items-center
                hover:bg-red-600 hover:text-black rounded-md text-red-600 font-semibold tracking-wide"
              >
                Quit Game
              </button>
            </div>}
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
            <h3 className="font-semibold text-xl mb-4">Are you sure you want to quit?</h3>
            <p className="text-center mb-4">You will lose your rating if you leave now and the other player returns.</p>
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
