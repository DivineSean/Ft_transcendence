import ButterflyChart from "./charts/ButterflyChart";
import MainChart from "./charts/MainChart";
import MatchesChart from "./charts/MatchesChart";


const ProfileStatistics = () => {
  return (
    <div className="flex flex-col gap-32 overflow-y-auto no-scrollbar">
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
