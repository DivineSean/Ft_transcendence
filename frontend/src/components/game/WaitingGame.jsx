import { useState, useEffect, useContext,  } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";
import { BACKENDURL } from "../../utils/fetchWrapper.js";


const Counter = ({ createdAt }) => {
  const endTime = new Date(createdAt).getTime() + 60 * 1000;
  const [count, setCount] = useState(endTime - Date.now());

  useEffect(() => {
    const updateTime = () => {
      if (endTime > Date.now())
        setCount(Math.floor((endTime - Date.now()) / 1000));
    };
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return count > 0 ? count : 0;
};


const WaitingGame = ({ data, send, game }) => {

	const navigate = useNavigate();
	const userContextData = useContext(UserContext);

	let me = 0;
	let other = 0;
	if (userContextData.userInfo.username === data.players[0].user.username) {
		me = 0;
		other = 1;
	} else {
		me = 1;
		other = 0;
	}


	return (
		<div className="bg-black/50 absolute top-0 left-0 flex justify-center items-center w-full h-full">
			<div className="primary-glass lg:w-[60%] md:w-[80%] w-[90%] justify-center flex flex-col overflow-hidden gap-64 p-16 md:p-32">
				<div className="flex flex-col gap-16">
					<div className="flex md:gap-32 gap-16 items-center justify-center">
						<div className="justify-center items-center flex gap-8 grow">
							<div className="md:!w-64 md:!h-64 !w-40 !h-40 bg-green flex rounded-full overflow-hidden border border-stroke-sc">
								<img
									src={
										data.players[me].user.profile_image
											? `${BACKENDURL}${data.players[me].user.profile_image}?t=${new Date().getTime()}`
											: "/images/default.jpeg"
									}
									alt="player 1 image"
								/>
							</div>
							<div className="flex flex-col items-center">
								<h2 className="font-bold tracking-wider md:text-txl-md text-txt-xs">@{data.players[me].user.username}</h2>
								<h2
									className={`tracking-wider md:text-txt-sm text-txt-xs
										${data.players[me].ready ? 'text-green' : 'text-red'}
									`}
								>
										{data.players[me].ready ? 'accepted' : 'pending!'}
								</h2>
							</div>
						</div>
						<div className="font-bold uppercase text-green/80 md:text-h-lg-lg text-h-sm-sm">vs</div>
						<div className="justify-center items-center flex gap-8 grow">
							<div className="md:!w-64 md:!h-64 !w-40 !h-40 bg-green flex rounded-full overflow-hidden border border-stroke-sc">
								<img
									src={
										data.players[other].user.profile_image
											? `${BACKENDURL}${data.players[other].user.profile_image}?t=${new Date().getTime()}`
											: "/images/default.jpeg"
									}
									alt="player 1 image"
								/>
							</div>
							<div className="flex flex-col items-center">
								<h2 className="font-bold tracking-wider md:text-txl-md text-txt-xs">@{data.players[other].user.username}</h2>
								<h2
									className={`tracking-wider md:text-txt-sm text-txt-xs
										${data.players[other].ready ? 'text-green' : 'text-red'}
									`}
								>
										{data.players[other].ready ? 'accepted' : 'pending!'}
								</h2>
							</div>
						</div>
					</div>
					<div className="flex justify-center text-gray tracking-wide lowercase gap-2">
						<Counter createdAt={data.created_at} />s
					</div>
				</div>

				<div className="flex flex-col gap-16">
					<div className="font-semibold tracking-wider justify-center items-center flex gap-16">
						<div className="w-64 h-[1px] bg-gray"></div>
						<h2>{game} game</h2>
						<div className="w-64 h-[1px] bg-gray"></div>
					</div>
					<div className="flex flex-col">
						<div className="flex justify-center items-center gap-8">
							<h2 className="font-semibold tracking-wide text-gray">victory:</h2>
							<h1 className="font-bold text-txt-2xl tracking-wider text-green">+{data.players[me].rating_gain}</h1>
						</div>
						<div className="flex justify-center items-center gap-8">
							<h2 className="font-semibold tracking-wide text-gray">defeat:</h2>
							<h1 className="font-bold text-txt-2xl tracking-wider text-red">-{data.players[me].rating_gain}</h1>
						</div>
					</div>
				</div>

				<div className="flex gap-16 justify-center">
					<button
						onClick={() => {
							send(
								JSON.stringify({
									type: "ready",
									message: {},
								}),
							);
						}}
						className="secondary-glass p-8 px-32 transition-all flex gap-4 justify-center items-center
							hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
					>
						Accept
					</button>
					<button
						onClick={() => navigate('/games/')}
						className="secondary-glass p-8 px-16 transition-all flex gap-4 justify-center items-center
							hover:bg-red/60 hover:text-white rounded-md text-red tracking-wide"
					>
						find another game
					</button>
				</div>
			</div>
		</div>
	)
}

export default WaitingGame;