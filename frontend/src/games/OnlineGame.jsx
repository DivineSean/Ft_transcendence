import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../customHooks/useWebsocket";
import { IoIosInformationCircleOutline } from "react-icons/io";

const OnlineGame = ({ game = "" }) => {
	const [status, setStatus] = useState("searching")
	const [playerCount, setPlayerCount] = useState(0);
	const [eta, setEta] = useState(0);
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
			else if (data.type == "update_time") {
				setEta(data.message.estimated_time);
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
		<div className="h-full flex flex-col justify-center items-center p-16">
			<div className="nes-container md:w-1/2 w-full is-rounded is-centered flex flex-col gap-8 justify-center">
				{status === "searching" && (
					<>
						<div className="flex justify-center items-center gap-16">
							{inQueue ? (
								<>
									<Timer start={Date.now()} />
									<MatchmakingInfo eta={eta} />
								</>
							) : (
								<p className="md:text-txt-lg text-txt-xs">
									Let's find you a worthy opponent
								</p>
							)}
						</div>
						{playerCount !== 0 &&
							<div className="md:text-txt-lg text-txt-xs">{playerCount} player{playerCount !== 1 && <span>s</span>} searching</div>
						}
						<button
							className={`nes-btn md:!text-txt-lg !text-txt-xs ${inQueue ? "is-error" : "is-primary"}`}
							onClick={inQueue ? handleLeaveQueue : handleStartQueue}
						>
							{inQueue ? "Cancel" : "Start"}
						</button>
					</>
				)}
				{status === "reconnecting" && (
					<>
						<p className="md:text-txt-lg text-txt-xs">You are already participating in an active game room.</p>
						<button className="nes-btn md:!text-txt-lg !text-txt-xs is-primary" onClick={() => navigate(activeGameRef.current)}>
							Reconnect
						</button>
					</>
				)}
			</div>
		</div>
	);
};

const Timer = ({ start }) => {
	const [time, setTime] = useState(Math.floor((Date.now() - start) / 1000));

	useEffect(() => {
		const intervalId = setInterval(() => {
			setTime(Math.floor((Date.now() - start) / 1000));
		}, 1000);
		return () => clearInterval(intervalId);
	}, [])

	const formatTime = (value) => value.toString().padStart(2, "0");

	const minutes = formatTime(Math.floor(time / 60));
	const seconds = formatTime(time % 60);

	return (
		<div className="md:text-txt-lg text-txt-xs">
			{minutes}:{seconds}
		</div>
	);
}

const MatchmakingInfo = ({ eta = 0 }) => {
	const formatTime = (value) => value.toString().padStart(2, "0");

	const minutes = formatTime(Math.floor(eta / 60));
	const seconds = formatTime(eta % 60);

	return (
		<div className="relative inline-block group">
			<IoIosInformationCircleOutline className="md:text-txt-3xl text-txt-xl nes-pointer" />

			<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap px-8 py-2 bg-black/80 text-white text-left text-txt-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
				<div>ETA: {minutes}:{seconds}</div>

				<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-t-[10px] border-t-black/80 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent"></div>
			</div>
		</div>
	);
}

export default OnlineGame;
