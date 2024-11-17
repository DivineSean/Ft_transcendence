import * as THREE from 'three';
import { vec3 } from 'three/webgpu';
import { rotate } from 'three/webgpu';
import { distance } from 'three/webgpu';

const BALL_MAX_SPEED = 0.05;

class Paddle {
	constructor(ws, scene, player, position, controls, loader, ball) {
		this.scene = scene;
		this.player = player;
		this.controls = controls;
		this.loader = loader;
		this.ball = ball;
		this.power = 0.000;
		this.ws = ws;
		this.model = undefined;
		this.shadow = undefined;
		this.boundingBox = undefined;


		this.x = position.x;
		this.y = position.y;
		this.z = position.z;

		if (this.player === -1){
			//OLD
			// this.rotationX = Math.PI / 2;
			// this.rotationZ = Math.PI / 2;
			//NEW
			this.rotationX = -Math.PI;
			this.rotationZ = Math.PI / 2;
		}
		else
		{
			//OLD
			// this.rotationX = -Math.PI / 2;
			// this.rotationZ = -Math.PI / 2;
			//NEW
			this.rotationX = 0;
			this.rotationZ = -Math.PI / 2;
		}
		this.rotationY = 0;
		// this.rotationX = Math.PI / 2;
		// this.rotationZ = -Math.PI / 2;

		this.dx = 0.0;
		this.dy = 0.0;
		this.dz = 0.0;
		
		this.left = true;
		this.right = false;
		this.rotating = false;
	}

	update(keyboard, ball, ws, dt) {

		if (!this.model)
            return;
		this.ball = ball;
		// apply friction
		this.dx *= 0.8;
		this.dy *= 0.8;
		this.dz *= 0.8;
		//TO DO : FIX RIGHT LEFT WHEN SHOT THE BALL
		if (this.player == -1)
		{
			this.x = Math.min(this.x + this.dx * dt, -5);
			if (keyboard[this.controls.space] && !this.rotating){
				this.rotatePaddle();
			}
			if (keyboard[this.controls.left]  && !this.rotating)
			{
				this.dz += 0.008 * this.player;
				this.z = this.z + this.dz * dt;
				// this.rotationX = Math.PI / 2;
				// this.rotationZ = Math.PI / 2;
				this.rotationX = 0;
				this.rotationZ = Math.PI / 2;
				this.rotationY = 0;
				this.left = false;
				this.right = true;
			}
			if (keyboard[this.controls.right]  && !this.rotating)
			{
				this.dz -= 0.008 * this.player;
				this.z = this.z + this.dz * dt;
				// this.rotationX = -Math.PI / 2;
				// this.rotationZ = Math.PI / 2;
				this.rotationX = -Math.PI;
				this.rotationZ = Math.PI / 2;
				this.rotationY = 0;
				this.left = true;
				this.right = false;
			}
			if (keyboard[this.controls.down] && !this.rotating){
				this.dx += 0.008 * this.player;
				this.x = this.x + this.dx * dt;
			}
			if (keyboard[this.controls.up] && !this.rotating){
				this.dx -= 0.008 * this.player;
				this.x = this.x + this.dx * dt;
			}
		}
		else
		{
			this.x = Math.max(this.x + this.dx * dt, 5);
			if (keyboard[this.controls.space] && !this.rotating){
				this.rotatePaddle();
			}
			if (keyboard[this.controls.right] && !this.rotating)
			{
				this.dz -= 0.008 * this.player;
				this.z = this.z + this.dz * dt;
				// this.rotationX = -Math.PI / 2;
				// this.rotationZ = -Math.PI / 2;
				this.rotationX = 0;
				this.rotationZ = -Math.PI / 2;
				this.rotationY = 0;
				this.left = false;
				this.right = true;

			}
			if (keyboard[this.controls.left]  && !this.rotating)
			{
				this.dz += 0.008 * this.player;
				this.z = this.z + this.dz * dt;
				// this.rotationX = Math.PI / 2;
				// this.rotationZ = -Math.PI / 2;
				this.rotationX = Math.PI;
				this.rotationZ = -Math.PI / 2;
				this.rotationY = 0;
				this.left = true;
				this.right = false;
			}
			if (keyboard[this.controls.down] && !this.rotating){
				this.dx += 0.008 * this.player;
				this.x = this.x + this.dx * dt;
			}
			if (keyboard[this.controls.up] && !this.rotating){
				this.dx -= 0.008 * this.player;
				this.x = this.x + this.dx * dt;
			}
		}
		if (this.rotating)
		{
			const data = {
				'message': {
					'content': 'rotating',
					'paddle': {
						rotX: this.rotationX,
						rotY: this.rotationY,
						rotZ: this.rotationZ,
					},
				}
			}
			ws.send(JSON.stringify(data));
		}
		else if (Math.abs(this.dx) > 0.001 || Math.abs(this.dz) > 0.001)
		{
			const data = {
				'message': {
					'content': 'paddle',
					'paddle': {
						x: this.x,
						y: this.y,
						z: this.z,
						dx: this.dx,
						dy: this.dy,
						dz: this.dz,
						rotX: this.rotationX,
						rotY: this.rotationY,
						rotZ: this.rotationZ,
					},
				}
			}
			ws.send(JSON.stringify(data));
		}
		this.model.position.set(this.x, this.y, this.z);
		this.model.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
		this.boundingBox.setFromObject(this.model);
		let s = new THREE.Vector3();
		this.boundingBox.getCenter(s);
	}
	
	send(ws, info, content) {
		const data = {
			'type': 'update',
			'message': {
				'info': info,
				'content': content,
			},
		}
		ws.send(JSON.stringify(data));
	}

	checkCollision() {
		const paddlePosition = new THREE.Vector3(this.x, this.y, this.z);
    	const ballPosition = new THREE.Vector3(this.ball.x, this.ball.y, this.ball.z);
		const distance = paddlePosition.distanceTo(ballPosition);
		return Math.abs(distance);
	}

	rotatePaddle() {
		if (!this.left && !this.right)
			return;
		this.rotating = true;
		const rotationDuration = 200;
		const initialRotationY = this.rotationY; // Current rotation around Y axis
		const initialRotationZ = this.rotationZ; // Current rotation around X axis
		const initialRotationX = this.rotationX;
		let targetRotationZ;
		let targetRotationY;
		let targetRotationX = undefined;

		if (this.left){
			if (this.player === -1)
			{
				targetRotationY = initialRotationY - Math.PI / 4; // Rotate 45 degrees to the left
			}
			else targetRotationY = initialRotationY + Math.PI / 4; // Rotate 45 degrees to the left
			targetRotationZ = initialRotationZ + Math.PI / 8; // Rotate 22.5 degrees around X
			if (this.ball.y > this.boundingBox.max.y)
			{
				this.rotationY = 0;
				this.rotationX = Math.PI / 2;
				this.rotationZ = -Math.PI / 2;

				// this.rotationX = 0;
				// if (this.player === -1)
				// {
				// 	this.rotationX = -10;
				// 	targetRotationX = initialRotationX + Math.PI / 2;
				// }
			}
		}
		else if (this.right){
			if (this.player === -1)
			{
				targetRotationY = initialRotationY - Math.PI / 4; // Rotate 45 degrees to the right
			}
			else targetRotationY = initialRotationY + Math.PI / 4; // Rotate 45 degrees to the right
			targetRotationZ = initialRotationZ + Math.PI / 8; // Rotate 22.5 degrees around X
			if (this.ball.y > this.boundingBox.max.y)
			{
				this.rotationY = 0;
				this.rotationX = Math.PI / 2;
				this.rotationZ = -Math.PI / 2;
				// this.rotationX = -10;
				// targetRotationX = initialRotationX + Math.PI / 2;
			}
		}
		const start = Date.now();
	
		const animateRotation = () => {
			const elapsed = Date.now() - start;
			const t = Math.min(elapsed / rotationDuration, 1); // Clamp t to 0 to 1
	
			// Easing function (ease-out)
			const easedT = 1 - Math.pow(1 - t, 3);
	
			// Update rotations
			this.rotationY = initialRotationY + (targetRotationY - initialRotationY) * easedT;
			this.rotationZ = initialRotationZ + (targetRotationZ - initialRotationZ) * easedT;
			if (targetRotationX != undefined)
				this.rotationX = initialRotationX + (targetRotationX - initialRotationZ) * easedT;
			if (t < 1) {
				requestAnimationFrame(animateRotation);
			} else {
				this.resetPaddleRotation(initialRotationY, initialRotationZ, initialRotationX);
			}
		};
		animateRotation();
	}
	
	
	resetPaddleRotation(initialRotationY, initialRotationZ, initialRotationX) {
		const resetDuration = 100;
		const start = Date.now();
	
		const animateReset = () => {
			const elapsed = Date.now() - start;
			const t = Math.min(elapsed / resetDuration, 1);
	
			// Easing function (ease-in)
			const easedT = t * t; // Quadratic easing for a smooth return
	
			const currentRotationY = this.rotationY;
			let deltaY = initialRotationY - currentRotationY;
			if (deltaY > Math.PI) deltaY -= 2 * Math.PI;
			if (deltaY < -Math.PI) deltaY += 2 * Math.PI;
	
			// Normalize angle differences for Z rotation
			const currentRotationZ = this.rotationZ;
			let deltaZ = initialRotationZ - currentRotationZ;
			if (deltaZ > Math.PI) deltaZ -= 2 * Math.PI;
			if (deltaZ < -Math.PI) deltaZ += 2 * Math.PI;


			const currentRotationX = this.rotationX;
			let deltaX = initialRotationX - currentRotationX;
			if (deltaX > Math.PI) deltaX -= 2 * Math.PI;
			if (deltaX < -Math.PI) deltaX += 2 * Math.PI;
			
			// Update rotations
			this.rotationY = currentRotationY + deltaY * easedT;
			this.rotationZ = currentRotationZ + deltaZ * easedT;
			if (this.rotationX != initialRotationX)
				this.rotationX = currentRotationX + deltaX * easedT;
	
			if (t < 1) {
				requestAnimationFrame(animateReset);
			}
			else this.rotating = false;
		};
		animateReset();
	}
	
	shoot(net, keyboard, ball, dt)
	{
		if (this.player === 1) {
			ball.x = this.boundingBox.min.x - 1;
		} else {
			ball.x = this.boundingBox.max.x + 1;
		}


		let BallMaxSpeed = 0.05;
		let power = 0.02;
		ball.dx = Math.min(Math.abs(ball.dx) + 0.05, BallMaxSpeed);
		ball.dx *= -this.player; // Reverse direction based on player
	
		ball.dy = power;
		// if (this.player === -1)
		// 	ball.y = net.boundingBox.max.y + 3;
		// else
		ball.y = net.boundingBox.max.y + 2;
		//Player one can shot left properly

		if (keyboard[this.controls.left] && this.rotating){
			//Medium Range
			if (this.z > 12)
			{
				ball.dz = 0.032 * this.player;
			}
			else if (this.z > 0)
			{
				ball.dz = 0.016 * this.player;
			}
			else if (this.z < 0 && this.z > -12)
			{
				ball.dz = 0.008 * this.player;
			}
			else {
				ball.dz = 0.004 * this.player;
			}
		}
		if (keyboard[this.controls.right] && this.rotating){
			 //medium range
			if (this.z > 12)
			{
				ball.dz = -0.004 * this.player;
			}
			else if (this.z > 0)
			{
				ball.dz = -0.008 * this.player;
			}
			else if (this.z < 0 && this.z > -12)
			{
				ball.dz = -0.016 * this.player;
			}
			else {
				ball.dz = -0.032 * this.player;
			}
		}

		const data = {
			'message': {
				'content': 'ball',
				'ball': {
					x: ball.x,
					y: ball.y,
					z: ball.z,
					dx: ball.dx,
					dy: ball.dy,
					dz: ball.dz,
				}
			}
		}
		this.ws.send(JSON.stringify(data));
	}

	netshoot(ball, net, ws)
	{
		if (ball.x > 0 && this.player === -1 || ball.x < 0 && this.player === 1)
			return;
		ball.dx = Math.min(Math.abs(ball.dx) + 0.05, 0.01);
		
		if (this.player === -1) {
			ball.x = net.boundingBox.min.x - 1;//-0.5
			ball.dx *= -1;
		} else {
			ball.x = net.boundingBox.max.x + 1;//0.5
		}

		const data = {
			'message': {
				'content': 'ball',
				'ball': {
					x: ball.x,
					y: ball.y,
					z: ball.z,
					dx: ball.dx,
					dy: ball.dy,
					dz: ball.dz,
				}
			}
		}
		ws.send(JSON.stringify(data));
	}

	hit(ball, ws)
	{
		if (this.player === 1) {
			ball.x = this.boundingBox.min.x - 1;
		} else {
			ball.x = this.boundingBox.max.x + 1;
		}

		ball.dx = Math.min(Math.abs(ball.dx) + 0.05, 0.01);
		ball.dx *= -this.player;

		const data = {
			'message': {
				'content': 'ball',
				'ball': {
					x: ball.x,
					y: ball.y,
					z: ball.z,
					dx: ball.dx,
					dy: ball.dy,
					dz: ball.dz,
				}
			}
		}
		ws.send(JSON.stringify(data));
	}

	updatePos() {
		this.model.position.set(this.x, this.y, this.z);
		this.model.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
	}

	async render() {
		this.model = await this.loader.loadAsync(`https://${window.location.hostname}:3000/src/games/pong/Paddle.glb`)
            .then(data => data.scene.children[0]);
        this.model.position.set(this.x, this.y, this.z);
		this.model.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
        this.model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        this.scene.add(this.model);

        // collision
        this.boundingBox = new THREE.Box3().setFromObject(this.model);
	}
}

export default Paddle;
