import { useContext } from "react";
import ButterflyChart from "./charts/ButterflyChart";
import MainChart from "./charts/MainChart";
import MatchesChart from "./charts/MatchesChart";
import XPChart from "./charts/XPChart";
import UserContext from "@/context/UserContext";


const ProfileStatistics = () => {
	const userContextData = useContext(UserContext);

	console.log(userContextData.profileInfo);

  return (
    <div className="flex flex-col gap-32 overflow-y-auto no-scrollbar">
			<div className="">
				<XPChart data={userContextData.profileInfo.exp_history} />
			</div>
			<div className="flex flex-col gap-16 p-16 bg-gray/10 rounded-lg">
				<h1 className="font-semibold tracking-wider text-gray/80 text-txt-lg">
					pong
				</h1>
				<div className="flex flex-col gap-16">
					<MainChart />
					<div className="flex md:flex-row flex-col gap-16">
						<MatchesChart />
						<ButterflyChart />
					</div>
				</div>
			</div>
    </div>
  );
};
export default ProfileStatistics;
