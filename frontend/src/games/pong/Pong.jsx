import SceneManager from './SceneManager';
import Table from './Table';
import Paddle from './Paddle';
import Ball from './Ball';
import { Clock } from 'three';
import { useEffect, useRef } from 'react';

const Pong = ({ websocket, player, ready }) => {
	const sm = useRef(null);
	// const playersRef = useRef(null);
	// const ballRef = useRef(null);

	const keyboard = useRef({});
	const handleKeyDown = (event) => {
		// console.log(event);
		keyboard.current[event.code] = true;
	}
	const handleKeyUp = (event) => {
		keyboard.current[event.code] = false;
	}

	useEffect(() => {
		sm.current = new SceneManager(player == 2 ? -1 : 1);
		const table = new Table(sm.current.scene);
		const ball = new Ball(sm.current.scene);
		const controls = {
			up: "KeyW",
			down: "KeyS",
			left: "KeyA",
			right: "KeyD",
		}
		const players = [
			new Paddle(sm.current.scene, 1, { x: 0.0, y: 45, z: 5 }, controls, 0x118811),
			new Paddle(sm.current.scene, -1, { x: 0.0, y: -45, z: 5 }, controls, 0x881111)
		]
		// playersRef.current = players;
		// ballRef.current = ball;
		let lastServerBallUpdate = Date.now();

		// override ws onmessage
		websocket.onmessage = (event) => {
			// console.log(event);
			const msg = JSON.parse(event.data);
			console.log(msg);
			if (msg.message.content == 'Play')
				ready = true;
			if (msg.message.content == 'paddle') {
				const opp = player == 1 ? 2 : 1;

				// switch (msg.message.info) {
				// 	case 'paddle':
				// 		if (playersRef.current) {
				// 			playersRef.current[opp - 1].x = msg.message.content.x;
				// 			playersRef.current[opp - 1].y = msg.message.content.y;
				// 			playersRef.current[opp - 1].z = msg.message.content.z;
				// 			// playersRef.current.boundingBox.setFrom(playersRef.current.object);
				// 		}
				// 		break;
				// 	case 'ball':
				// 		if (ballRef.current) {
				// 			ballRef.current.x = msg.message.content.x;
				// 			ballRef.current.y = msg.message.content.y;
				// 			ballRef.current.z = msg.message.content.z;
				// 			ballRef.current.dx = msg.message.content.dx;
				// 			ballRef.current.dy = msg.message.content.dy;
				// 			ballRef.current.dz = msg.message.content.dz;
				// 		}
				// 		break;
				// }

				players[opp - 1].x = msg.message.paddle.x;
				players[opp - 1].y = msg.message.paddle.y;
				players[opp - 1].z = msg.message.paddle.z;
				players[opp - 1].updatePos();
				// console.log('chof wach bs7: ', players[opp - 1].boundingBox);
			}
			else if (msg.message.content == 'ball') {

				lastServerBallUpdate = Date.now();
				ball.x = msg.message.ball.x;
				ball.y = msg.message.ball.y;
				ball.z = msg.message.ball.z;
				ball.dx = msg.message.ball.dx;
				ball.dy = msg.message.ball.dy;
				ball.dz = msg.message.ball.dz;

				ball.object.position.set(ball.x, ball.y, ball.z);
				ball.boundingSphere.set(ball.object.position, 1);
			}
		}


		table.render();
		ball.render();
		players[0].render();
		players[1].render();

		const clock = new Clock();
		const animate = () => {
			if (!ready) return;

			let dt = clock.getDelta() * 1000;

			table.update();

			// Interpolation logic: Smooth out ball position between updates
			const now = Date.now();
			const timeSinceLastUpdate = now - lastServerBallUpdate;

			if (timeSinceLastUpdate < 100) {
				// Interpolate ball position based on last known velocity
				ball.x += ball.dx * (dt / 1000);
				ball.y += ball.dy * (dt / 1000);
				ball.z += ball.dz * (dt / 1000);
			}

			ball.update({}, table, players[0], players[1], player, websocket, dt);
			players[player - 1].update(keyboard.current, ball, websocket, dt);
			// players[player == 1 ? 1 : 0].updatePos();

			sm.current.renderer.render(sm.current.scene, sm.current.camera);
		}

		sm.current.renderer.setAnimationLoop(animate);

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			sm.current.cleanUp();
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		}
	}, [])

	return (
		<canvas id="pong"></canvas>
	);
}

export default Pong;
