import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GameManager from './GameManager';

const Match = () => {
	const [playerCount, setPlayerCount] = useState(0);
	const [inQueue, setInQueue] = useState(false);
	// const [match, setMatch] = useState(false);
	const [game, setGame] = useState(null);
	const navigate = useNavigate();
	const ws = useRef(null);

	useEffect(() => {
		return () => {
			if (ws.current)
				ws.current.close();
		};
	}, []);


	const handleStartQueue = () => {
		setInQueue(true);

		ws.current = new WebSocket(`wss://${window.location.hostname}:8000/ws/matchmaking/Pong`);

		ws.current.onopen = () => {
			console.log("Matchmaking ws connected");
		};

		ws.current.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log(data)
			if (data.type == 'update')
				setPlayerCount(data.message);
			else if (data.type == 'match_found') {
				setGame(data.message);
				// const { type, id } = data.message.game;
				// navigate(`/play/${type}/${id}`);
				// setMatch(true);
			}
		};

		ws.current.onclose = () => {
			console.log("Matchmaking ws disconnected");
		};
	};

	const handleLeaveQueue = () => {
		setInQueue(false);

		if (ws.current) {
			ws.current.close();
			ws.current = null;
			setPlayerCount(0);
		}
	};

	return game ? (<GameManager GameDetails={game} />) : (
		<div className="w-full h-screen flex flex-col justify-center items-center ">
			<div className="flex flex-col gap-y-3.5  backdrop-blur-sm justify-center items-center bg-gray-800 text-white rounded-lg shadow-md p-6 w-full max-w-md mx-auto border border-gray-700 h-1/4">
				<h2 className="text-2xl font-bold mb-3 text-orange-500">Matchmaking Queue</h2>

				<div className="flex items-center space-x-2 my-3">
					<span className="text-gray-300">Players in Queue:</span>
					<span className={"px-2 py-1 rounded-full text-sm font-semibold bg-gray-600 text-gray-300"}>
						{playerCount}
					</span>
				</div>

				<button
					onClick={inQueue ? handleLeaveQueue : handleStartQueue}
					className={`w-full py-2 mt-4 text-lg font-bold rounded-md transition duration-200 ${inQueue
						? 'bg-red-600 hover:bg-red text-white'
						: 'bg-orange-500 hover:bg-orange-600 text-white'
						}`}
				>
					{inQueue ? 'Leave Queue' : 'Join Queue'}
				</button>

				{inQueue && (
					<div className="mt-6 flex items-center justify-center space-x-2 text-gray-300">
						<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-orange-500"></div>
						<span className="text-sm">Finding match...</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default Match;
