import SceneManager from './SceneManager';
import Table from './Table';
import Paddle from './Paddle';
import Net from './Net';
import Ball from './Ball';
import { Clock } from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect, useRef, useState } from 'react';

let dt = 1;    ////added for debugging purpose
const Pong = ({ websocket, player }) => {
	const sm = useRef(null);
	const loaderRef = useRef(null);
	const loaderTRef = useRef(null);
	const loaderBRef = useRef(null);
	const keyboard = useRef({});
	const [ready, setReady] = useState(false)

	useEffect(() => {
		loaderTRef.current = new GLTFLoader();
		loaderRef.current = new GLTFLoader();
		loaderBRef.current = new GLTFLoader();
		sm.current = new SceneManager(player == 2 ? -1 : 1);
		// let factor = sm.current.camera.aspect / aspect;
		const table = new Table(sm.current.scene, loaderTRef.current);
		const net = new Net(sm.current.scene, loaderRef.current);
		const ball = new Ball(sm.current.scene, loaderBRef.current, player);
		const controls = {
			up: "ArrowUp",
			down: "ArrowDown",
			left: "ArrowLeft",  // Move left
			right: "ArrowRight", // Move right
			space: "Space",
			// Q: "KeyQ"            
			// E: "KeyE",           
		};


		const players = [
			new Paddle(websocket, sm.current.scene, 1, { x: 43, y: -25.5, z: 12 }, controls, loaderRef.current, ball),
			new Paddle(websocket, sm.current.scene, -1, { x: -43, y: -25.5, z: -12 }, controls, loaderRef.current, ball)
		]
		// playersRef.current = players;
		// ballRef.current = ball;
		let lastServerBallUpdate = Date.now();
		// override ws onmessage
		websocket.onmessage = (event) => {
			// console.log(event);
			const msg = JSON.parse(event.data);
			console.log(msg);
			const opp = player == 1 ? 2 : 1;
			if (msg.type == 'play')
				setReady(true);
			else if (msg.message.content == 'paddle') {
				players[opp - 1].rotating = false;
				players[opp - 1].x = msg.message.paddle.x;
				players[opp - 1].y = msg.message.paddle.y;
				players[opp - 1].z = msg.message.paddle.z;

				players[opp - 1].dx = msg.message.paddle.dx;
				players[opp - 1].dy = msg.message.paddle.dy;
				players[opp - 1].dz = msg.message.paddle.dz;

				players[opp - 1].rotationX = msg.message.paddle.rotX;
				players[opp - 1].rotationY = msg.message.paddle.rotY;
				players[opp - 1].rotationZ = msg.message.paddle.rotZ;
				players[opp - 1].updatePos();
			}
			else if (msg.message.content == 'rotating') {
				players[opp - 1].rotating = true;
				players[opp - 1].rotationX = msg.message.paddle.rotX;
				players[opp - 1].rotationY = msg.message.paddle.rotY;
				players[opp - 1].rotationZ = msg.message.paddle.rotZ;
				players[opp - 1].updatePos();
			}
			else if (msg.message.content == 'ball') {

				lastServerBallUpdate = Date.now();
				ball.x = msg.message.ball.x;
				ball.y = msg.message.ball.y;
				ball.z = msg.message.ball.z;
				ball.dx = msg.message.ball.dx;
				ball.dy = msg.message.ball.dy;
				ball.dz = msg.message.ball.dz;
				ball.updatePos(dt);
			}
		}
		sm.current.render();
		table.render();
		net.render();
		ball.render();
		players[0].render();
		players[1].render();

		let simulatedTime = performance.now() / 1000;
		const fixedStep = 0.015; // 15ms
		const clock = new Clock();

		const animate = () => {
			if (!ready) return;
			const timeNow = performance.now() / 1000;
			let dt = clock.getDelta() * 1000;

			table.update();
			while (timeNow > simulatedTime + fixedStep) {
				ball.update(net, table, players[player - 1], websocket, fixedStep * 1000, player, keyboard.current);
				simulatedTime += fixedStep;
			}

			const alpha = (timeNow - simulatedTime) / fixedStep;
			ball.x += ball.dx * alpha * fixedStep;
			ball.y += ball.dy * alpha * fixedStep;
			ball.z += ball.dz * alpha * fixedStep;

			players[player - 1].update(keyboard.current, ball, websocket, dt);
			sm.current.renderer.render(sm.current.scene, sm.current.camera);

		}


		sm.current.renderer.setAnimationLoop(animate);
		const handleKeyDown = (event) => {
			if (players[player - 1].rotating) return;
			keyboard.current[event.code] = true;
		};

		const handleKeyUp = (event) => {
			keyboard.current[event.code] = false;
		};

		const onWindowResize = () => {

			sm.current.camera.aspect = window.innerWidth / window.innerHeight;
			sm.current.camera.updateProjectionMatrix();

			sm.current.renderer.setSize(window.innerWidth, window.innerHeight);

		}

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('resize', onWindowResize, false);


		return () => {
			sm.current.cleanUp();
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('resize', onWindowResize);
		}
	}, [ready])

	return (
		<canvas id="pong"></canvas>
	);
}

export default Pong;
