import { MdGames } from "react-icons/md";
import { FaFire } from "react-icons/fa6";
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import UserContext from "@/context/UserContext";
import { useContext } from "react";

const ProfileOverview = () => {
  const userContextData = useContext(UserContext);
  const stats = userContextData.status.stats;

  const formatRecentResults = (results) => {
    if (!Array.isArray(results)) return Array(5).fill("-");
    const filledResults = [...results];
    while (filledResults.length < 5) {
      filledResults.push("-");
    }
    return filledResults;
  };

  const renderResult = (result, index) => {
    const classes = {
      W: "text-green",
      L: "text-red",
      default: "text-gray-400",
    };

    return (
      <span
        key={index}
        className={`flex uppercase font-bold ${classes[result] || classes.default}`}
      >
        {result || "-"}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-16 grow overflow-y-scroll no-scrollbar">
      <div className="flex flex-col rounded-[8px] border-[0.5px] border-stroke-sc overflow-hidden shrink-0">
        <div className='md:p-32 p-16 relative h-[220px] overflow-hidden flex items-end bg-[url("/images/pong-overview.webp")] bg-cover bg-center'>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden cover-gradient"></div>
          <h2 className="absolute font-bold md:text-h-lg-lg text-h-sm-lg">
            ping pong
          </h2>
        </div>
        <div className="flex md:px-32 px-16 py-16 gap-32 items-center">
          <MdGames className="text-green text-txt-3xl" />
          <div className="flex gap-40 justify-between grow">
            <div className="flex flex-col items-start">
              <span className="text-h-lg-sm">{stats.total_games}</span>
              <span className="text-txt-xs">Games Played</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-h-lg-sm">{stats.winrate.toFixed(1)}%</span>
              <span className="text-txt-xs">Win Rate</span>
            </div>
            <div className="flex flex-col items-end text-right">
              <div className="flex gap-1">
                {formatRecentResults(stats.recent_results).map(
                  (result, index) => renderResult(result, index),
                )}
              </div>
              <span className="flex text-txt-xs">recent result</span>
            </div>
          </div>
        </div>
        <div className="flex sc-overview-glass md:px-32 px-16 py-16 gap-32 items-center">
          <FaFire className="text-red text-txt-3xl" />
          <div className="flex gap-40 justify-between grow">
            <div className="flex flex-col items-start">
              <span className="text-h-lg-sm">{stats.elo}</span>
              <span className="text-txt-xs">current rank</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-h-lg-sm">{stats.mmr}</span>
              <span className="text-txt-xs">Rating Points</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <LuTrendingUp className="text-green w-7 h-5" />
                <span>{stats.promote}</span>
              </div>
              <div className="flex items-center gap-1">
                <LuTrendingDown className="text-red w-7 h-5 rotate-90" />
                <span>{stats.demote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
