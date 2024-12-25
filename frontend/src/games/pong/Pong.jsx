import SceneManager from "./SceneManager";
import Table from "./Table";
import Paddle from "./Paddle";
import Net from "./Net";
import Ball from "./Ball";
import { Clock } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect, useRef, useState, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import GameToast from "../../components/GameToast";

const Pong = ({
	send,
	ready,
	setReady,
	addMessageHandler,
	removeMessageHandler,
	player,
	names,
}) => {
	const sm = useRef(null);
	const loaderRef = useRef(null);
	const loaderTRef = useRef(null);
	const loaderBRef = useRef(null);
	const keyboard = useRef({});
	const authContextData = useContext(AuthContext);

	const [isWon, setIsWon] = useState(false);
	const [islost, setIslost] = useState(false);


	const tableRef = useRef(null);
	const netRef = useRef(null);
	const ballRef = useRef(null);
	const playersRef = useRef(null);

	useEffect(() => {
		loaderTRef.current = new GLTFLoader();
		loaderRef.current = new GLTFLoader();
		loaderBRef.current = new GLTFLoader();
		sm.current = new SceneManager(
			player == 2 ? -1 : 1,
			names,
			authContextData.setGlobalMessage,
			setIsWon,
			setIslost,
			setReady,
		);
		tableRef.current = new Table(sm.current.scene, loaderTRef.current);
		netRef.current = new Net(sm.current.scene, loaderRef.current);
		ballRef.current = new Ball(sm.current.scene, loaderBRef.current, player);
		const controls = {
			up: "ArrowUp",
			down: "ArrowDown",
			left: "ArrowLeft",
			right: "ArrowRight",
			space: "Space",
		};

		playersRef.current = [
			new Paddle(
				sm.current.scene,
				1,
				{ x: 43, y: -25.5, z: 12 },
				controls,
				loaderRef.current,
				ballRef.current,
			),
			new Paddle(
				sm.current.scene,
				-1,
				{ x: -43, y: -25.5, z: -12 },
				controls,
				loaderRef.current,
				ballRef.current,
			),
		];
		
		sm.current.render();
		tableRef.current.render();
		netRef.current.render();
		ballRef.current.render(sm.current);
		playersRef.current[0].render();
		playersRef.current[1].render();

		const messageHandler = (event) => {
			const msg = JSON.parse(event.data);
			const opp = player == 1 ? 2 : 1;
			if (msg.type === "score") {
				const scores = JSON.parse(msg.message.scores);
				const score1 = Number(scores["1"]);
				const score2 = Number(scores["2"]);
				if (Math.abs(score1 - score2) === 4) {
					if (score1 > score2 && sm.current.RemontadaPlayer === -1)
						sm.current.RemontadaChance = true;
					else if (score1 < score2 && sm.current.RemontadaPlayer === 1)
						sm.current.RemontadaChance = true;
				}
				if (Math.abs(score1 - score2) === 0 && sm.current.RemontadaChance) {
					if (!ballRef.current.Achievement.isPlaying) {
						ballRef.current.Achievement.currentTime = 0;
						ballRef.current.Achievement.play();
					}
					authContextData.setGlobalMessage({
						message:
							"From the brink of defeat to total domination. Truly inspiring!",
						title: "The Bounceback Boss Achieved",
					});
					sm.current.RemontadaChance = false;
				}
				sm.current.scoreUpdate(send, scores, msg.message.role, ballRef.current);
				if (msg.message.role === 1) {
					ballRef.current.serve(netRef.current, 1);
				} else if (msg.message.role === 2) {
					ballRef.current.serve(netRef.current, -1);
				}
			} else if (msg.message.content == "paddle") {
				playersRef.current[opp - 1].rotating = false;
				playersRef.current[opp - 1].x = msg.message.paddle.x;
				playersRef.current[opp - 1].y = msg.message.paddle.y;
				playersRef.current[opp - 1].z = msg.message.paddle.z;

				playersRef.current[opp - 1].dx = msg.message.paddle.dx;
				playersRef.current[opp - 1].dy = msg.message.paddle.dy;
				playersRef.current[opp - 1].dz = msg.message.paddle.dz;

				playersRef.current[opp - 1].rotationX = msg.message.paddle.rotX;
				playersRef.current[opp - 1].rotationY = msg.message.paddle.rotY;
				playersRef.current[opp - 1].rotationZ = msg.message.paddle.rotZ;
				playersRef.current[opp - 1].updatePos();
			} else if (msg.message.content == "rotating") {
				if (!ballRef.current.swing.isPlaying) {
					ballRef.current.swing.currentTime = 0;
					ballRef.current.swing.play();
				}
				playersRef.current[opp - 1].rotating = true;
				playersRef.current[opp - 1].rotationX = msg.message.paddle.rotX;
				playersRef.current[opp - 1].rotationY = msg.message.paddle.rotY;
				playersRef.current[opp - 1].rotationZ = msg.message.paddle.rotZ;
				playersRef.current[opp - 1].updatePos();
			} else if (msg.message.content == "ball") {
				if (msg.message.ball.stats === "shoot") {
					if (!ballRef.current.paddleHitSound.isPlaying) {
						ballRef.current.paddleHitSound.currentTime = 0;
						ballRef.current.paddleHitSound.play();
					}
				} else if (msg.message.ball.stats === "hit") {
					if (!ballRef.current.onlyHit.isPlaying) {
						ballRef.current.onlyHit.currentTime = 0;
						ballRef.current.onlyHit.play();
					}
				}
				ballRef.current.x = msg.message.ball.x;
				ballRef.current.y = msg.message.ball.y;
				ballRef.current.z = msg.message.ball.z;
				ballRef.current.dx = msg.message.ball.dx;
				ballRef.current.dy = msg.message.ball.dy;
				ballRef.current.dz = msg.message.ball.dz;
				ballRef.current.count = 0;
				ballRef.current.serving = msg.message.ball.serving;
				ballRef.current.lastshooter = msg.message.ball.lstshoot;
				ballRef.current.isServerDemon = false;
				ballRef.current.updatePos();
			} else if (msg.message.content == "lost") {
				ballRef.current.serving = msg.message.ball.serving;
				ballRef.current.lastshooter = msg.message.ball.lstshoot;
				ballRef.current.sendLock = true;
				ballRef.current.sendScore(send);
			}
		};

		addMessageHandler(messageHandler);

		const handleKeyDown = (event) => {
			if (playersRef.current[player - 1].rotating) return;
			keyboard.current[event.code] = true;
		};

		const handleKeyUp = (event) => {
			keyboard.current[event.code] = false;
		};

		const onWindowResize = () => {
			sm.current.camera.aspect = window.innerWidth / window.innerHeight;
			sm.current.camera.updateProjectionMatrix();

			sm.current.renderer.setSize(window.innerWidth, window.innerHeight);
			ballRef.current.labelRenderer.setSize(window.innerWidth, window.innerHeight);
			sm.current.ScalePlan();
			sm.current.scoreRender(ballRef.current.scoreboard, ballRef.current.whoscore);
			sm.current.addMatchPoint(ballRef.current.scoreboard);
			sm.current.TimeRender(false);
			sm.current.TimerCSS();
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("resize", onWindowResize, false);

		return () => {
			sm.current.cleanup();
			ballRef.current.cleanup();
			tableRef.current.cleanup();
			netRef.current.cleanup();
			playersRef.current[0].cleanup();
			playersRef.current[1].cleanup();
			removeMessageHandler(messageHandler);
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("resize", onWindowResize);
		};
	}, [])

	useEffect(() => {
		if (!tableRef.current || !netRef.current || !ballRef.current || !playersRef.current || !sm.current)
			return;

		const table = tableRef.current;
		const net = netRef.current;
		const ball = ballRef.current;
		const players = playersRef.current;

		let simulatedTime = performance.now() / 1000;
		const fixedStep = 0.015;
		const clock = new Clock();

		const animate = () => {
			if (
				!ready ||
				!ball.model ||
				!net.boundingBox ||
				!table.boundingBoxTable ||
				!players[player - 1].boundingBox ||
				!ball.boundingSphere ||
				!ball.bounceSound ||
				!ball.netHitSound ||
				!ball.paddleHitSound ||
				!ball.onlyHit ||
				!ball.swing ||
				!ball.scoreSound ||
				!ball.BackgroundMusic ||
				!ball.lostSound ||
				!ball.ballMatchPoint ||
				!ball.Defeat ||
				!ball.Victory
			)
				return;
			if (!ball.BackgroundMusic.isPlaying) {
				ball.BackgroundMusic.currentTime = 0;
				ball.BackgroundMusic.play();
			}
			const timeNow = performance.now() / 1000;
			let dt = clock.getDelta() * 1000;

			while (timeNow > simulatedTime + fixedStep) {
				ball.update(
					net,
					table,
					players[player - 1],
					send,
					fixedStep * 1000,
					player,
					keyboard.current,
					authContextData.setGlobalMessage,
				);
				simulatedTime += fixedStep;
			}
			if (ball.scoreboard[0] !== 7 && ball.scoreboard[1] !== 7) {
				if (ball.serving && !ball.timeout && !ball.sendLock) {
					if (
						(player === 1 && ball.lastshooter === 1) ||
						(player === 2 && ball.lastshooter === -1)
					) {
						ball.CheckTimer(send);
						ball.labelRenderer.render(sm.current.scene, sm.current.camera);
					}
				}
				if (Math.floor((Date.now() - sm.current.lastTime) / 1000) > 0)
					sm.current.TimerCSS(ball);
			}

			const alpha = (timeNow - simulatedTime) / fixedStep;
			ball.x += ball.dx * alpha * fixedStep;
			ball.y += ball.dy * alpha * fixedStep;
			ball.z += ball.dz * alpha * fixedStep;

			players[player - 1].update(keyboard.current, ball, send, dt);
			const cameraDirection = sm.current.camera.position;
			sm.current.renderer.render(sm.current.scene, sm.current.camera);
			if (cameraDirection != sm.current.camera.position)
				sm.current.scoreUpdate();
		};

		sm.current.renderer.setAnimationLoop(animate);
		
		return () => sm.current.renderer.setAnimationLoop(null);
	}, [ready, isWon, islost]);

	function handleExitGame() {
		window.location.href = "/games/pong/online";
		window.close();
	}

	return (
		<div id="message" className="relative w-full h-screen overflow-hidden">
			{authContextData.globalMessage.message && !isWon && !islost && (
				<GameToast
					duration={4000}
					message={authContextData.globalMessage.message}
					title={authContextData.globalMessage.title}
					onClose={authContextData.setGlobalMessage}
				/>
			)}
			<canvas id="pong" className="block"></canvas>
			{/* Victory Section */}
			{isWon && (
				<div className="flex absolute inset-0 items-center justify-center bg-black bg-opacity-60 z-10">
					<div className="text-center transform scale-110">
						<img
							className="w-[250px] h-[250px] mx-auto transition-all transform hover:scale-110"
							src="/images/eto.gif"
							alt="Victory Dance"
						/>
						<div className="mb-6 mt-8">
							<p className="text-5xl font-extrabold text-white animate__animated animate__bounceIn animate__delay-2000ms">
								Victory
							</p>
							<p className="text-2xl font-semibold mt-4 text-white animate__animated animate__fadeIn animate__delay-4000ms">
								You Won Like a Ping Pong Champion!
							</p>
							<button
								className="relative mt-16 inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white uppercase transition-all duration-500 border-2 border-fuchsia-500 rounded-full shadow-lg hover:shadow-fuchsia-500/50 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-blue-500 hover:from-blue-500 hover:to-fuchsia-500 hover:scale-110"
								onClick={handleExitGame}
							>
								<span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 via-yellow-500 to-red-400 opacity-0 transition-opacity duration-300 hover:opacity-50"></span>
								<span className="z-10">Continue</span>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Defeat Section */}
			{islost && (
				<div className="flex absolute inset-0 items-center justify-center bg-black bg-opacity-60 z-10">
					<div className="text-center transform scale-110">
						<img
							className="w-[250px] h-[250px] mx-auto transition-all transform hover:scale-110"
							src="/images/bmo.gif"
							alt="Defeat"
						/>
						<div className="mb-6 mt-8">
							<p className="text-5xl font-extrabold text-white animate__animated animate__bounceIn animate__delay-2000ms">
								Defeat
							</p>
							<p className="text-2xl font-semibold mt-4 text-white animate__animated animate__fadeIn animate__delay-4000ms">
								Good Luck Next Time Champion!
							</p>
							<button
								className="relative mt-16 inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white uppercase transition-all duration-500 border-2 border-fuchsia-500 rounded-full shadow-lg hover:shadow-fuchsia-500/50 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-blue-500 hover:from-blue-500 hover:to-fuchsia-500 hover:scale-110"
								onClick={handleExitGame}
							>
								<span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 via-yellow-500 to-red-400 opacity-0 transition-opacity duration-300 hover:opacity-50"></span>
								<span className="z-10">Continue</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Pong;
