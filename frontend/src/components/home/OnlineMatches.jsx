import React from 'react';
import { IoGameController } from 'react-icons/io5';
import { GiPingPongBat } from 'react-icons/gi';
import { BACKENDURL } from "../../utils/fetchWrapper";
import { useNavigate } from "react-router-dom";

const formattedTime = (match) => {
  const elapsedTimeInSeconds = Math.floor(
    (Date.now() - match.started_at) / 1000,
  );
  const minutes = Math.floor(elapsedTimeInSeconds / 60);

  const seconds = elapsedTimeInSeconds % 60;
  const time = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return time;
}

const Matches = ({data}) => {
  const navigate = useNavigate();
  return (
    <>
      {data && data.length !== 0 &&
      <>
          {data.map((match) => (
            <div key={match.id} className="grid md:grid-cols-[20px_1fr_1fr_1fr_1fr] grid-cols-[20px_1fr_1fr_1fr] gap-32 text-center text-txt-sm md:text-txt-md items-center">
              <GiPingPongBat className="md:ml-16 ml-8" />
              <div className="flex gap-4 normal-case justify-center items-center">
                <div className="min-w-24 max-w-24 min-h-24 max-h-24 md:min-w-32 md:max-w-32 md:min-h-32 md:max-h-32 rounded-full overflow-hidden flex border-[0.5px] border-stroke-sc">
                  <img
                    src={
                     match.players[0].profile_image
                        ? `${BACKENDURL}${match.players[0].profile_image}?t=${new Date().getTime()}`
                        : "/images/default.jpeg"
                    }
                    alt=""
                    className="object-cover grow"
                  />
                </div>
                <p className="font-bold text-green">vs</p>
                <div className="min-w-24 max-w-24 min-h-24 max-h-24 md:min-w-32 md:max-w-32 md:min-h-32 md:max-h-32 rounded-full overflow-hidden flex border-[0.5px] border-stroke-sc">
                <img
                    src={
                     match.players[1].profile_image
                        ? `${BACKENDURL}${match.players[1].profile_image}?t=${new Date().getTime()}`
                        : "/images/default.jpeg"
                    }
                    alt=""
                    className="object-cover grow"
                  />
                </div>
              </div>

              <div className="md:flex gap-4 justify-center hidden">
                <p>{match.players[0].score}</p>
                <p className="font-bold text-green">-</p>
                <p>{match.players[1].score}</p>
              </div>

              <p>{formattedTime(match)}</p>
              <div className="">
                <button
                  className="secondary-glass p-8 font-semibold text-txt-sm transition-all hover:bg-green/60 hover:text-black rounded-md text-green capitalize"
                  onClick={() => navigate(`/games/${match.game}/online/${match.id}`)}
                >
                  watch
                </button>
              </div>
            </div>
          ))}
        </>
      }
    </>
  );
};

// OnlineMatches component where matches data is passed as prop
const OnlineMatches = ({ data }) => {
  return (
    <div className="glass-component flex-col md:gap-32 gap-16 ">
      <h3 className="md:text-h-lg-md text-h-sm-md">Online Matches</h3>
      <div className="secondary-glass py-8 flex-col flex lg:max-h-[500px] max-h-[400px]">
        <div className="overflow-y-scroll md:px-16 px-8 flex flex-col custom-scrollbar gap-16">
          <div className="grid md:grid-cols-[20px_1fr_1fr_1fr_1fr] grid-cols-[20px_1fr_1fr_1fr] gap-32 items-center text-center font-bold py-8 bg-gray/5 rounded-lg">
            <IoGameController className="md:ml-16 ml-8" />
            <p>players</p>
            <p className="hidden md:block">scores</p>
            <p>time</p>
            <p>live</p>
          </div>
          <div className="flex flex-col gap-16 overflow-y-scroll no-scrollbar z-10">
            <Matches data={data} />
            {data && data.length === 0 &&
              <p className="text-center text-gray-500 text-stroke-sc">No online matches available at the moment.</p>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineMatches;
