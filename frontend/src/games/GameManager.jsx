import { useState, useEffect, memo, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Pong from "./pong/Pong";
import useWebSocket from "../customHooks/useWebsocket";
import UserContext from "../context/UserContext.jsx";

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

	return <div>{count}</div>;
};

const GameOverlay = ({ data, send }) => {
	console.log("data: ", data);
	switch (data.status) {
		case "waiting":
			return (
				<div className="flex flex-col gap-16 w-full justify-center items-center">
					<div className="flex gap-16">
						<span className={`normal-case ${data.players[0].ready ? "text-green" : "text-red"}`}>@{data.players[0].user.username}</span>
						<span className="normal-case">vs</span>
						<span className={`normal-case ${data.players[1].ready ? "text-green" : "text-red"}`}>@{data.players[1].user.username}</span>
					</div>
					<div className="flex gap-32">
						<span className="normal-case">+{data.players[0].rating_gain} -{data.players[0].rating_gain}</span>
						<span className="normal-case">+{data.players[0].rating_gain} -{data.players[0].rating_gain}</span>
					</div>
					<Counter createdAt={data.created_at} />
					<div className="flex justify-center">
						<button onClick={() => {
							send(JSON.stringify({
								type: "ready",
								message: {}
							}))
						}}>Accept</button>
					</div>
				</div>
			);
		case "expired":
			return <div>Game invite expired</div>
		case "ongoing":
			return <div>Game starting soon ...</div>
		case "paused":
			return <div>Game paused</div>
		case "completed":
			return <div>Game concluded</div>
		default:
			return <>nn hh</>
	}
}

const Game = memo(({ userInfo, game, ready, setReady, send, addMessageHandler, removeMessageHandler, players, turn }) => {
	const data = players.current?.find((player) => player.user.username === userInfo.username)
	console.log("hadi hya data dyali hhhh", userInfo?.username, players, data);

	useEffect(() => {
		console.log("Game component renered");
	}, []);

	switch (game) {
		case "pong":
			return <Pong
				ready={ready}
				setReady={setReady}
				playersData={players.current}
				turn={turn}
				player={data.role}
				send={send}
				addMessageHandler={addMessageHandler}
				removeMessageHandler={removeMessageHandler}
			/>;
	}
})

const GameManager = () => {
	const [ready, setReady] = useState(false);
	const [data, setData] = useState(null);
	const { game, uuid } = useParams();
	const playersRef = useRef(null);
	const { send, addMessageHandler, removeMessageHandler } = useWebSocket(`wss://${window.location.hostname}:8000/ws/games/${uuid}`, {
		onMessage: (event) => {
			const msg = JSON.parse(event.data);

			if (msg.type === "game_manager") {
				// INFO: check if the objects are the same to avoid unnecessary rerenders
				if (msg.message.status)
					setReady(msg.message.status === "ongoing")
				console.log(msg);
				if (msg.message.players)
					playersRef.current = msg.message.players;
				setData((prevData) => ({
					...prevData,
					...msg.message,
				}))
			}
		}
	})

	useEffect(() => {
		console.log("this nigga's readiness: ", ready);
	}, [ready]);

	const contextData = useContext(UserContext);
	useEffect(() => {
		contextData.getUserInfo();
	}, []);

	return (
		<div className="relative w-full">
			{
				contextData.userInfo && playersRef.current &&
				(<Game
					game={game}
					ready={ready}
					setReady={setReady}
					send={send}
					userInfo={contextData.userInfo}
					addMessageHandler={addMessageHandler}
					removeMessageHandler={removeMessageHandler}
					players={playersRef}
					turn={data.turn}
				/>)
			}
			{!ready && data && (
				<div className="absolute inset-0 backdrop-blur-sm container justify-center items-center">
					<div className="primary-glass p-32">
						<GameOverlay data={data} send={send} />
					</div>
				</div>
			)}
		</div>
	);
};
export default GameManager;
