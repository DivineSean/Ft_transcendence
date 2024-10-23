import { useState, useEffect, useRef } from "react";
import * as THREE from 'three';

const PLAYER1_SHOOT = 'Space';
const PLAYER2_SHOOT = 'ControlRight';

const Games = () => {
	const ws = useRef(null);
	let p1Shoot = useRef(false);
	let p2Shoot = useRef(false);

	const renderRef = useRef(null);
	const sceneRef = useRef(new THREE.Scene());
	const cameraRef = useRef(new THREE.PerspectiveCamera(
		60,  //fov
		// window.innerWidth / window.innerHeight, // perspective
		1,
		0.1, // near Plane
		1000, // far Plane
	));
	const mountRef = useRef(null);
	let playing = false;

	const handleMessage = (event) => {
		const msg = JSON.parse(event.data);
		console.log(msg);
		const pos = msg.message.position;
		paddle1.position.x = pos;
	}

	const update = (delta) => {
		// Aply forces
		ballVelocity.z -= 0.1 * delta;
		// ballVelocity.y += 0.01 * delta;

		ball.position.add(ballVelocity);

		// bounding boxes
		const tableBox = new THREE.Box3().setFromObject(cube);
		const ballBox = new THREE.Box3().setFromObject(ball);
		const p1Box = new THREE.Box3().setFromObject(paddle1);
		const p2Box = new THREE.Box3().setFromObject(paddle2);

		if (ballBox.intersectsBox(tableBox)) {
			// console.log("Collides");
			ballVelocity.z = -ballVelocity.z * 0.5;
			ball.position.z = 0.1;
		}
		if ((ballBox.intersectsBox(p1Box) && p1Shoot)
			|| ballBox.intersectsBox(p2Box) && p2Shoot) {
			// console.log("Hit: ", p1Shoot ? "Player 1" : "Player 2");
			ballVelocity.y *= -1;
			ballVelocity.z = 0.07;
		}
	}

	const KeyDown = (event) => {
		console.log(event);
		let p1_pos = paddle1.position.x;
		let p2_pos = paddle2.position.x;

		if (event.code == 'KeyA')
			p1_pos -= 0.1;
		else if (event.code == 'KeyD')
			p1_pos += 0.1;

		if (event.code == 'ArrowRight')
			p2_pos -= 0.1;
		else if (event.code == 'ArrowLeft')
			p2_pos += 0.1;

		if (event.code == PLAYER1_SHOOT)
			p1Shoot = true;
		if (event.code == PLAYER2_SHOOT)
			p2Shoot = true;

		const data = {
			"message": {
				"player": 1,
				"position": p1_pos,
			}
		}
		ws.current.send(JSON.stringify(data));
	}

	const KeyUp = (event) => {

		if (event.code == PLAYER1_SHOOT)
			p1Shoot = false;
		if (event.code == PLAYER2_SHOOT)
			p2Shoot = false;
	}

	useEffect(() => {

		ws.current = new WebSocket("wss://localhost:8000/ws/games/");
		console.log(ws.current);
		ws.current.onmessage = handleMessage;

		renderRef.current = new THREE.WebGLRenderer();
		renderRef.current.setSize(1000, 1000);

		// TODO: Setup lighting

		cameraRef.current.position.z = 4;
		cameraRef.current.position.y = -4;
		cameraRef.current.lookAt(0, 0, 0);

		const clock = new THREE.Clock();

		const animate = () => {
			let delta = clock.getDelta();
			// cube.rotation.x += 0.01;
			// cube.rotation.y += 0.01;
			update(delta);
			renderRef.current.render(sceneRef.current, cameraRef.current);
		}

		renderRef.current.setAnimationLoop(animate);

		if (mountRef.current)
			mountRef.current.appendChild(renderRef.current.domElement);

		window.addEventListener('keydown', KeyDown);
		window.addEventListener('keyup', KeyUp);

		return () => {
			ws.current.close();
			if (mountRef.current)
				mountRef.current.removeChild(renderRef.current.domElement);
			window.removeEventListener('keydown', KeyDown)
			window.removeEventListener('keyup', KeyUp);
		}
	}, [])


	// Game logic

	// Pong table
	const cubeGeom = new THREE.BoxGeometry(3, 5, 0.1);
	const cubeMater = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const cube = new THREE.Mesh(cubeGeom, cubeMater);
	sceneRef.current.add(cube);

	// Player1 paddle
	const pad1Geom = new THREE.BoxGeometry(1, 0.15, 0.1);
	const pad1Mater = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const paddle1 = new THREE.Mesh(pad1Geom, pad1Mater);
	paddle1.position.y = -2.4;
	paddle1.position.z = 0.1;
	sceneRef.current.add(paddle1);

	// Player2 paddle
	const pad2Geom = new THREE.BoxGeometry(1, 0.15, 0.1);
	const pad2Mater = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const paddle2 = new THREE.Mesh(pad2Geom, pad2Mater);
	paddle2.position.y = 2.4;
	paddle2.position.z = 0.1;
	sceneRef.current.add(paddle2);

	// Pong ball
	const ballGeom = new THREE.SphereGeometry(0.1);
	const ballMater = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const ball = new THREE.Mesh(ballGeom, ballMater);
	let ballVelocity = new THREE.Vector3(0, 0, 0);
	ball.position.z = 2;
	ballVelocity.y = 0.05;
	sceneRef.current.add(ball);


	return (
		<div ref={mountRef}></div>
	)
}

export default Games;
