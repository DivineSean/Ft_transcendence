import { BACKENDURL } from "@/utils/fetchWrapper";
import { useNavigate } from "react-router-dom";

const TopThreePlayers = ({ players }) => {
  const navigate = useNavigate();
  const visualOrder = [1, 0, 2];
  const heights = ["h-[120px]", "h-[160px]", "h-[80px]"];
  const imgSizes = [
    "md:w-[80px] md:h-[80px] w-[56px] h-[56px]",
    "md:w-[96px] w-[64px] md:h-[96px] h-[64px]",
    "md:w-[80px] w-[56px] md:h-[80px] h-[56px]",
  ];
  const textSizes = [
    "text-h-lg-2xl",
    "text-h-lg-4xl text-green",
    "text-h-lg-xl",
  ];

  const handleProfileClick = (username) => {
    navigate(`/profile/overview/${username}`);
  };

  return (
    <div className="grid grid-cols-3 md:gap-32 gap-16 items-end justify-center lg:px-64 md:px-16 px-8">
      {visualOrder.map((playerIndex, visualIndex) => {
					if (players[playerIndex]) {
						return (
							<div key={visualIndex} className="flex flex-col gap-16">
								<div
									className="flex flex-col items-center gap-8 cursor-pointer"
									onClick={() => handleProfileClick(players[playerIndex].username)}
								>
									<div
										className={`${imgSizes[visualIndex]} rounded-full
											border-2 ${visualIndex === 1 ? 'border-[#DAA520]' : 'border-green'}
											relative flex 
										`}
									>
										{visualIndex === 1 && 
											<div className="absolute top-0 -right-16 h-40 w-40 flex items-center justify-center">
												<img src="/images/badges/victoryBadge.png" alt="victory badge" className="object-cover grow" />
											</div>
										}
										<img
											src={
												players[playerIndex].profile_image
													? `${BACKENDURL}${players[playerIndex].profile_image}?t=${new Date().getTime()}`
													: "/images/default.jpeg"
											}
											className={`object-cover grow rounded-full`}
											alt={players[playerIndex].username}
											draggable="false"
										/>
									</div>
									<h2
										className={
											visualIndex === 1
												? "md:text-txt-md text-txt-xs"
												: "text-txt-xs"
										}
									>
										{players[playerIndex].username}
									</h2>
								</div>
								<div
									className={`${heights[visualIndex]} bg-[url('/images/background.png')] bg-top bg-cover norepeat overflow-hidden relative flex justify-center items-center rounded-t-lg`}
								>
									<div className="absolute hover-secondary backdrop-blur-2xl w-full h-full"></div>
									<p className={`${textSizes[visualIndex]} font-bold z-10`}>
										{players[playerIndex].rank}
									</p>
								</div>
							</div>
						)
					} else {
						return (
							<div key={visualIndex} className="flex flex-col gap-16">
								<div
									className="flex flex-col items-center gap-8 cursor-pointer"
									onClick={() => handleProfileClick(players[playerIndex].username)}
								>
									<div
										className={`${imgSizes[visualIndex]} rounded-full
											border-2 ${visualIndex === 1 ? 'border-[#DAA520]' : 'border-green'}
											relative flex 
										`}
									>
										{visualIndex === 1 && 
											<div className="absolute top-0 -right-16 h-40 w-40 flex items-center justify-center">
												<img src="/images/badges/victoryBadge.png" alt="victory badge" className="object-cover grow" />
											</div>
										}
										<img
											src="/images/default.jpeg"
											className={`object-cover grow rounded-full`}
											alt='player picture'
											draggable="false"
										/>
									</div>
									<h2
										className={
											visualIndex === 1
												? "md:text-txt-md text-txt-xs"
												: "text-txt-xs"
										}
									>
										no one
									</h2>
								</div>
								<div
									className={`${heights[visualIndex]} bg-[url('/images/background.png')] bg-top bg-cover norepeat overflow-hidden relative flex justify-center items-center rounded-t-lg`}
								>
									<div className="absolute hover-secondary backdrop-blur-2xl w-full h-full"></div>
									<p className={`${textSizes[visualIndex]} font-bold z-10`}>
									{visualIndex === 1 ? 1 : visualIndex === 0 ? 2 : 3}
									</p>
								</div>
							</div>
						)
					}
				})}
    </div>
  );
};

export default TopThreePlayers;