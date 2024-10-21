import SceneManager from './SceneManager';
import Table from './Table';
import Paddle from './Paddle';
import Ball from './Ball';
import { Clock } from 'three';
import { useEffect, useRef } from 'react';

const Pong = ({ websocket, player }) => {
	const sm = useRef(null);
	const playersRef = useRef(null);

	const keyboard = useRef({});
	const handleKeyDown = (event) => {
		// console.log(event);
		keyboard.current[event.code] = true;
	}
	const handleKeyUp = (event) => {
		keyboard.current[event.code] = false;
	}

	const handleMessage = (event) => {
		// console.log(event);
		const msg = JSON.parse(event.data);
		// console.log(msg);
		if (msg.type == 'update') {
			const opp = player == 1 ? 2 : 1;

			if (playersRef.current) {
				playersRef.current[opp - 1].x = msg.message.x;
				playersRef.current[opp - 1].y = msg.message.y;
				playersRef.current[opp - 1].z = msg.message.z;
			}
		}
	}

	useEffect(() => {
		sm.current = new SceneManager(player == 2 ? -1 : 1);
		const table = new Table(sm.current.scene);
		const ball = new Ball(sm.current.scene);
		const controls = {
			up: "",
			down: "",
			left: "KeyA",
			right: "KeyD",
		}
		const players = [
			new Paddle(sm.current.scene, 1, { x: 0.0, y: 45, z: 5 }, controls, 0x118811),
			new Paddle(sm.current.scene, -1, { x: 0.0, y: -45, z: 5 }, controls, 0x881111)
		]
		playersRef.current = players;

		// override ws onmessage
		websocket.onmessage = handleMessage;

		table.render();
		ball.render();
		players[0].render();
		players[1].render();

		const clock = new Clock();
		const animate = () => {
			let dt = clock.getDelta() * 1000;

			table.update();
			ball.update();
			players[player - 1].update(keyboard.current, ball, websocket, dt);
			players[player == 1 ? 1 : 0].updatePos();

			sm.current.renderer.render(sm.current.scene, sm.current.camera);
			requestAnimationFrame(animate);
		}

		animate();

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
