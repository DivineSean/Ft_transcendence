import { useState, useEffect, memo, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Pong from "./pong/Pong";
import useWebSocket from "../customHooks/useWebsocket";
import UserContext from "../context/UserContext.jsx";

const Counter = ({ createdAt }) => {
	const endTime = new Date(createdAt).getTime() + 60 * 1000;
	const [count, setCount] = useState(endTime - Date.now())

	useEffect(() => {
		const updateTime = () => {
			if (endTime > Date.now())
				setCount(Math.floor((endTime - Date.now()) / 1000));
		}
		const intervalId = setInterval(updateTime, 1000)

		return () => clearInterval(intervalId);
	}, []);

	return <div>{count}</div>
}

const GameOverlay = ({ status, data, send }) => {
	console.log("status: ", status, data);
	switch (status) {
		case "waiting":
			return (
				<div className="flex flex-col gap-16 w-full justify-center items-center">
					<div className="flex gap-16">
						<span className={`normal-case ${data.players_details[0].ready ? "text-green" : "text-red"}`}>@{data.players_details[0].user.username}</span>
						<span className="normal-case">vs</span>
						<span className={`normal-case ${data.players_details[1].ready ? "text-green" : "text-red"}`}>@{data.players_details[1].user.username}</span>
					</div>
					<div className="flex gap-32">
						<span className="normal-case">+{data.players_details[0].rating_gain} -{data.players_details[0].rating_gain}</span>
						<span className="normal-case">+{data.players_details[0].rating_gain} -{data.players_details[0].rating_gain}</span>
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
		default:
			return <>nn hh</>
	}
}

const Game = memo(({ userInfo, game, status = "", send, addMessageHandler, removeMessageHandler, playersDetails, state }) => {
	const [ready, setReady] = useState(status === "ongoing");

	useEffect(() => {
		setReady(status === "ongoing")
	}, [status])

	const data = playersDetails.current?.find((player) => player.user.username === userInfo.username)
	const names = playersDetails.current?.map((player) => player.user.username) || [];
	console.log("hadi hya data dyali hhhh", userInfo?.username, playersDetails, data);

	switch (game) {
		case "pong":
			return <Pong send={send} ready={ready} setReady={setReady} addMessageHandler={addMessageHandler} removeMessageHandler={removeMessageHandler} player={data.role} names={names} />;
		// return <div>pong</div>
	}
})

const GameManager = () => {
	// const [playerNumber, setPlayerNumber] = useState(-1);
	const [status, setStatus] = useState(null);
	const [data, setData] = useState(null);
	const { game, uuid } = useParams();
	const playersDetailsRef = useRef(null);
	const { send, addMessageHandler, removeMessageHandler } = useWebSocket(`wss://${window.location.hostname}:8000/ws/games/${uuid}`, {
		onMessage: (event) => {
			const msg = JSON.parse(event.data);

			if (msg.type === "game_manager") {
				// INFO: check if the objects are the same to avoid unnecessary rerenders
				if (msg.message.status)
					setStatus(msg.message.status);
				console.log(msg);
				if (msg.message.players_details)
					playersDetailsRef.current = msg.message.players_details;
				setData({
					...data,
					...msg.message,
				})
			}
		}
	})

	const contextData = useContext(UserContext);
	useEffect(() => {
		contextData.getUserInfo();
	}, [])

	// TODO: handle match accept
	// TODO: handle reconnect after accepting

	return (
		<div className="relative w-full">
			{
				contextData.userInfo && playersDetailsRef.current && (
					<Game userInfo={contextData.userInfo} game={game} status={status} send={send} addMessageHandler={addMessageHandler} removeMessageHandler={removeMessageHandler} playersDetails={playersDetailsRef} />)
			}
			{status !== "ongoing" && (
				<div className="absolute inset-0 backdrop-blur-sm container justify-center items-center">
					<div className="primary-glass p-32">
						<GameOverlay status={status} data={data} send={send} />
					</div>
				</div>
			)}
		</div>
	);
};
export default GameManager;
