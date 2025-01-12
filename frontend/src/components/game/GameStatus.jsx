import { useNavigate } from "react-router-dom";

const GameStatus = ({ game, title, image }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-black/50 backdrop-blur-sm absolute top-0 left-0 flex justify-center items-center w-full h-full overflow-y-auto no-scroll">
      <div className="lg:w-[80%] md:w-[70%] w-[65%] h-auto">
        <div className="primary-glass overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_520px] grid-cols-1 min-h-[200px] lg:min-h-[500px]">
            <div className="flex flex-col justify-center items-center p-8 md:p-16 gap-8 md:gap-12">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Uh Oh! What Happened to the {game}?
              </h1>
              
              <div className="text-center text-white/90 text-sm md:text-base lg:text-lg max-w-[80%]">
                {title}
                . No worry! You can try playing a different game mode or search for a new opponent or even watching a live game. Lets get back in the action — are you ready?
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full justify-center">
                <button
                  onClick={() => navigate(`/games/${game}/online`)}
                  className="primary-glass py-2 md:py-4 px-6 md:px-8 transition-all flex justify-center items-center hover:bg-blue-400/20 rounded-md text-blue-400 font-semibold border border-blue-400/20 text-sm md:text-base"
                >
                  Go Back
                </button>
              </div>
            </div>
            <div className="relative h-32 md:h-64 lg:h-full order-first lg:order-last">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStatus;
