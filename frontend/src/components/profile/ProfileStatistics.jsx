import { useContext, useEffect } from "react";
import ButterflyChart from "./charts/ButterflyChart";
import MainChart from "./charts/MainChart";
import MatchesChart from "./charts/MatchesChart";
import XPChart from "./charts/XPChart";
import UserContext from "@/context/UserContext";

const ProfileStatistics = () => {
  const userContextData = useContext(UserContext);
  const stats = userContextData.status.stats;
  useEffect(()=>{
    console.log(userContextData.status);
  }, [])
  return (
    <div className="flex flex-col gap-32 overflow-y-auto no-scrollbar">
      <div className="">
        <XPChart data={userContextData.profileInfo.exp_history} />
      </div>
      <div className="flex flex-col gap-16 p-16 bg-gray/10 rounded-lg">
        <h1 className="font-semibold tracking-wider text-gray/80 text-txt-lg">
          {userContextData.status.game}
        </h1>
        <div className="flex flex-col gap-16">
          <MainChart ratingHistory={stats.rating_history} />
          {/* for testing */}
          {/* <MainChart /> */}
          <div className="flex md:flex-row flex-col gap-16">
            <MatchesChart totalgames={stats.total_games} winrate={stats.winrate}/>
            <ButterflyChart />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileStatistics;
