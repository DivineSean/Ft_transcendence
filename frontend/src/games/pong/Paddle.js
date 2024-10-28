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
			this.rotationX = Math.PI / 2;
			this.rotationZ = Math.PI / 2;
		}
		else
		{
			this.rotationX = -Math.PI / 2;
			this.rotationZ = -Math.PI / 2;
		}
		this.rotationY = 0;

		this.dx = 0.0;
		this.dy = 0.0;
		this.dz = 0.0;
		
		this.left = false;
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

		console.log(keyboard);
		// if (keyboard[this.controls.space] && !this.rotating){
		// 	this.rotatePaddle(keyboard);
		// }
		// else if (keyboard[this.controls.left] && !this.rotating) this.dz += 0.008 * this.player;
		// else if (keyboard[this.controls.right] && !this.rotating) this.dz -= 0.008 * this.player;
		// else if (keyboard[this.controls.down] && !this.rotating) this.dx += 0.008 * this.player;
		// else if (keyboard[this.controls.up] && !this.rotating) this.dx -= 0.008 * this.player;

		// this.z = this.z + this.dz * dt;
		// this.x = this.x + this.dx * dt;
		
		if (this.player == -1)
		{
			this.x = Math.min(this.x + this.dx * dt, -5);
				if (keyboard[this.controls.space] && !this.rotating){
					this.rotatePaddle(keyboard);
				}
				if (keyboard[this.controls.left]  && !this.rotating)
				{
					this.dz += 0.008 * this.player;
					this.z = this.z + this.dz * dt;
					this.rotationX = Math.PI / 2;
					this.rotationZ = Math.PI / 2;
					this.rotationY = 0;
					this.left = false;
					this.right = true;
	
				}
				if (keyboard[this.controls.right]  && !this.rotating)
				{
					this.dz -= 0.008 * this.player;
					this.z = this.z + this.dz * dt;
					this.rotationX = -Math.PI / 2;
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
				this.rotatePaddle(keyboard);
			}
			if (keyboard[this.controls.right] && !this.rotating)
			{
				this.dz -= 0.008 * this.player;
				this.z = this.z + this.dz * dt;
				this.rotationX = -Math.PI / 2;
				this.rotationZ = -Math.PI / 2;
				this.rotationY = 0;
				this.left = false;
				this.right = true;

			}
			if (keyboard[this.controls.left]  && !this.rotating)
			{
				this.dz += 0.008 * this.player;
				this.z = this.z + this.dz * dt;
				this.rotationX = Math.PI / 2;
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

		this.model.position.set(this.x, this.y, this.z);
		this.model.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
		// recalculate boundingBox
		this.boundingBox.setFromObject(this.model);

		let s = new THREE.Vector3();
        this.boundingBox.getCenter(s);
		if (Math.abs(this.dx) > 0.001
			|| Math.abs(this.dz) > 0.001) {// send new position as long as the ball is moving
			const data = {
				'message': {
					'content': 'paddle',
					'paddle': {
						x: this.x,
						y: this.y,
						z: this.z,
						rotX: this.rotationX,
						rotY: this.rotationY,
						rotZ: this.rotationZ,
					},
				}
			}
			ws.send(JSON.stringify(data));
		}
	}

	checkCollision() {
		const paddlePosition = new THREE.Vector3(this.x, this.y, this.z);
    	const ballPosition = new THREE.Vector3(this.ball.x, this.ball.y, this.ball.z);
		const distance = paddlePosition.distanceTo(ballPosition);
		return Math.abs(distance);
	}

	rotatePaddle(keyboard) {
		this.rotating = true;
		const rotationDuration = 300;
		const initialRotationY = this.rotationY; // Current rotation around Y axis
		const initialRotationZ = this.rotationZ; // Current rotation around X axis
		const initialRotationX = this.rotationX;
		let targetRotationZ;
		let targetRotationY;
		let targetRotationX = undefined;

		if (this.left){
			targetRotationY = initialRotationY - Math.PI / 4; // Rotate 45 degrees to the left
			targetRotationZ = initialRotationZ + Math.PI / 8; // Rotate 22.5 degrees around X
			if (this.ball.y > this.boundingBox.max.y)
			{
				this.rotationX = 0;
				if (this.player === -1)
				{
					this.rotationX = -10;
					targetRotationX = initialRotationX + Math.PI / 2;
				}
			}
		}
		else if (this.right){
			targetRotationY = initialRotationY + Math.PI / 4; // Rotate 45 degrees to the right
			targetRotationZ = initialRotationZ + Math.PI / 8; // Rotate 22.5 degrees around X
			if (this.ball.y > this.boundingBox.max.y)
			{
				this.rotationX = -10;
				targetRotationX = initialRotationX + Math.PI / 2;
			}
		}
		else { this.rotating = false; return; }
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
			let distance = this.checkCollision();
			if (distance < 4) {
				this.shoot(keyboard, distance);
			}
			if (t < 1) {
				requestAnimationFrame(animateRotation);
			} else {
				this.resetPaddleRotation(initialRotationY, initialRotationZ, initialRotationX);
			}
		};
		animateRotation();
	}
	
	
	resetPaddleRotation(initialRotationY, initialRotationZ, initialRotationX) {
		const resetDuration = 200;
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
			this.rotationX = currentRotationX + deltaX * easedT;
	
			if (t < 1) {
				requestAnimationFrame(animateReset);
			}
			else this.rotating = false;
		};
		animateReset();
	}
	

	shoot(keyboard, distance)
	{
		if (this.player === 1) {
			this.ball.x = this.boundingBox.min.x - 1;
		} else {
			this.ball.x = this.boundingBox.max.x + 1;
		}
		let BallMaxSpeed = 0.05;
		let power = 0.02;
		// if (distance > 3) {
		// 	BallMaxSpeed = 0.02; // Longer distance: less speed
		// 	// power = 0.04; // Less upward force
		// } else if (distance > 2) {
		// 	BallMaxSpeed = 0.04; // Medium distance: moderate speed
		// 	// power = 0.05; // Moderate upward force
		// } else {
		// 	BallMaxSpeed = 0.05; // Close distance: maximum speed
		// 	// power = 0.02; // Maximum upward force
		// }
		// Apply maximum speed limit
		this.ball.dx = Math.min(Math.abs(this.ball.dx) + 0.05, BallMaxSpeed);
		this.ball.dx *= -this.player; // Reverse direction based on player
	
		// Set vertical speed based on calculated power
		this.ball.dy = power * -this.player;
		
		if (keyboard[this.controls.left]) this.ball.dz += 0.002 * this.player;
		if (keyboard[this.controls.right]) this.ball.dz -= 0.002 * this.player;

		const data = {
			'message': {
				'content': 'ball',
				'ball': {
					x: this.ball.x,
					y: this.ball.y,
					z: this.ball.z,
					dx: this.ball.dx,
					dy: this.ball.dy,
					dz: this.ball.dz,
				}
			}
		}
		this.ws.send(JSON.stringify(data));
	}

	hit(net, ball, ws)
	{
		if (this.player === 1) {
			ball.x = this.boundingBox.min.x - 2;
		} else {
			ball.x = this.boundingBox.max.x + 2;
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

	updatePos(rotation_x, rotation_y, rotation_z) {
		this.model.position.set(this.x, this.y, this.z);
		this.model.rotation.set(rotation_x, rotation_y, rotation_z);
		// this.shadow.position.set(this.x, 0.015, this.z);
	}

	async render() {
		this.model = await this.loader.loadAsync(`https://${window.location.hostname}:3000/src/games/pong/Paddles2.glb`)
            .then(data => data.scene.children[0]);
		// this.model.scale.set(2,2,2);
        this.model.position.set(this.x, this.y, this.z);
		this.model.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
        this.model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true; // Enable shadow casting
                child.receiveShadow = false; // Typically, nets don’t receive shadows
            }
        });
        this.scene.add(this.model);

        // collision
        this.boundingBox = new THREE.Box3().setFromObject(this.model);
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
}

export default Paddle;
