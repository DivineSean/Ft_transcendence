import { GiPingPongBat } from "react-icons/gi";
import { IoGameController } from "react-icons/io5";


const Matches = ({game, player1, player2, score1, score2, time}) => {
  return (
  <div className="grid md:grid-cols-[20px_1fr_1fr_1fr_1fr] grid-cols-[20px_1fr_1fr_1fr] gap-32 text-center text-txt-sm md:text-txt-md items-center">
    <GiPingPongBat className="md:ml-16 ml-8"/>
    <div className="flex gap-4 normal-case justify-center items-center">
      <div className="min-w-24 max-w-24 min-h-24 max-h-24 md:min-w-32 md:max-w-32 md:min-h-32 md:max-h-32 rounded-full overflow-hidden flex border-[0.5px] border-stroke-sc">
        <img src="/images/default.jpeg" alt="" className="object-cover grow" />
      </div>
      <p className="font-bold text-green">vs</p>
      <div className="min-w-24 max-w-24 min-h-24 max-h-24 md:min-w-32 md:max-w-32 md:min-h-32 md:max-h-32 rounded-full overflow-hidden flex border-[0.5px] border-stroke-sc">
        <img src="/images/default.jpeg" alt="" className="object-cover grow" />
      </div>
    </div>

    <div className="md:flex gap-4 justify-center hidden">
      <p>{score1}</p>
      <p className="font-bold text-green">-</p>
      <p>{score2}</p>
    </div>

    <p>{time}</p>
    <div className="">
      <button
        className="secondary-glass p-8 font-semibold text-txt-sm transition-all hover:bg-green/60 hover:text-black rounded-md text-green capitalize"
      >
        watch
      </button>
    </div>
  </div>
  );
};

const OnlineMatches = () => {
  const matches = [];
  for (let i = 0; i < 100; i++) {
    //add the data from backend
    matches.push(
      <Matches game="pong" player1="Mohamed" player2="Ali" score1={0} score2={1} time={"02:32"}/>
    );
  }
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
           {matches}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineMatches;
