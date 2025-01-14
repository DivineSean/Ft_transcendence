import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../customHooks/useWebsocket";

const OnlineGame = ({ game = "" }) => {
	const [status, setStatus] = useState("searching")
	const [playerCount, setPlayerCount] = useState(0);
	const [inQueue, setInQueue] = useState(false);
	const activeGameRef = useRef(null);
	const navigate = useNavigate();
	const { send } = useWebSocket(`ws/matchmaking/${game}`, {
		onMessage: (event) => {
			const data = JSON.parse(event.data);
			console.log(data);
			if (data.type == "update") setPlayerCount(data.message);
			else if (data.type == "match_found") {
				navigate(data.message.room_id);
			}
			else if (data.type == "reconnect") {
				activeGameRef.current = data.message.room_id;
				setStatus("reconnecting");
			}
		},
	});

	useEffect(() => {
		const isMobile = /android|iphone|ipad|ipod/i.test(
			navigator.userAgent || window.opera,
		);

		if (!isMobile) return;

		const exitFullscreen = () => {
			if (document.fullscreenElement) {
				// Exit fullscreen for browsers that support the Fullscreen API
				document.exitFullscreen().catch(() => { }); // Silently catch errors
			} else if (document.webkitFullscreenElement) {
				// Safari/Chrome
				document.webkitExitFullscreen();
			} else if (document.mozFullScreenElement) {
				// Firefox
				document.mozCancelFullScreen();
			} else if (document.msFullscreenElement) {
				// IE/Edge
				document.msExitFullscreen();
			}
		};

		const unlockOrientation = () => {
			if (screen.orientation?.unlock) {
				screen.orientation.unlock();
			}
		};

		try {
			exitFullscreen();
			unlockOrientation();
		} catch {
			// No action needed, errors are silently caught
		}

		return () => {
			unlockOrientation();
		};
	}, []);

	const handleStartQueue = () => {
		setInQueue(true);

		send(
			JSON.stringify({
				type: "join_queue",
				message: {},
			}),
		);
	};

	const handleLeaveQueue = () => {
		setInQueue(false);

		send(
			JSON.stringify({
				type: "leave_queue",
				message: {},
			}),
		);
	};

	return (
		<div className="h-full flex flex-col justify-center items-center p-8">
			<div className="nes-container is-rounded is-centered with-title">
				{status === "searching" && (
					<>
						<h1 className="title">Matchmaking Queue</h1>
						<p>Players searching: {playerCount}</p>
						<button
							className={`nes-btn ${inQueue ? "is-error" : "is-primary"}`}
							onClick={inQueue ? handleLeaveQueue : handleStartQueue}
						>
							{inQueue ? "Cancel" : "Start"}
						</button>
					</>
				)}
				{status === "reconnecting" && (
					<>
						<h1 className="title">Reconnect</h1>
						<p>You are already participating in an active game room.</p>
						<button className="nes-btn is-primary" onClick={() => navigate(activeGameRef.current)}>
							Reconnect
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default OnlineGame;
