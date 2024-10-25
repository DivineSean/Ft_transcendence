import * as THREE from 'three';

const BALL_MAX_SPEED = 0.05;

class Paddle {
	constructor(scene, player, position, controls, color, loader) {
		this.scene = scene;
		this.player = player;
		this.controls = controls;
		this.color = color;
		this.model = undefined;
		this.loader = loader;
		this.shadow = undefined;

		this.boundingBox = undefined;

		this.x = position.x;
		this.y = position.y;
		this.z = position.z;

		this.dx = 0.0;
		this.dy = 0.0;
		this.dz = 0.0;

		// this.rotation = { x: 0, y: 0, z: 0 };
	}

	update(keyboard, ball, ws, dt) {

		if (!this.model)
            return;
		// apply friction
		this.dx *= 0.8;
		this.dy *= 0.8;
		this.dz *= 0.8;

		// this.rotation.x *= 0.8;
        // this.rotation.y *= 0.8;
        // this.rotation.z *= 0.8;

		console.log(keyboard);
		if (keyboard[this.controls.left]) this.dz += 0.008 * this.player;
		if (keyboard[this.controls.right]) this.dz -= 0.008 * this.player;
		if (keyboard[this.controls.down]) this.dx += 0.008 * this.player;
		if (keyboard[this.controls.up]) this.dx -= 0.008 * this.player;

		this.z = this.z + this.dz * dt;
		this.x = this.x + this.dx * dt;

		if (this.player == -1)
			this.x = Math.min(this.x + this.dx * dt, -5);
		else
			this.x = Math.max(this.x + this.dx * dt, 5);

		this.model.position.set(this.x, this.y, this.z);

		// recalculate boundingBox
		this.boundingBox.setFromObject(this.model);

		let s = new THREE.Vector3();
        this.boundingBox.getCenter(s);
        this.shadow.position.set(s.x, 0.015, s.z);

		// // rotation
		// this.model.rotation.x += this.rotation.x;
		// this.model.rotation.y += this.rotation.y;
		// this.model.rotation.z += this.rotation.z;

		// if (Math.abs(this.dx) > 0.001
		// 	|| Math.abs(this.dy) > 0.001) // send new position as long as the ball is moving
		// 	this.send(ws, 'paddle', {
		// 		x: this.x,
		// 		y: this.y,
		// 		z: this.z,
		// 	});

		if (Math.abs(this.dx) > 0.001
			|| Math.abs(this.dz) > 0.001) {// send new position as long as the ball is moving
			const data = {
				'message': {
					'content': 'paddle',
					'paddle': {
						x: this.x,
						y: this.y,
						z: this.z,
					},
				}
			}
			ws.send(JSON.stringify(data));
		}
	}

	hit(net, ball, ws)
	{
		// console.log("hit them balls");

		if (this.player === 1) {
			ball.x = this.boundingBox.min.x - 2;
		} else {
			ball.x = this.boundingBox.max.x + 2;
		}

		console.log('Damn son: ', ball.dx);
		ball.dx = Math.min(Math.abs(ball.dx) + 0.05, BALL_MAX_SPEED);
		ball.dx *= -this.player;
		ball.dy = 0.02;//Power of shot

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
		this.shadow.position.set(this.x, 0.015, this.z);
	}

	async render() {
		this.model = await this.loader.loadAsync("https://localhost:3000/src/games/pong/Paddles2.glb")
            .then(data => data.scene.children[0]);
		// this.model.scale.set(2,2,2);
        this.model.position.set(this.x, this.y, this.z);
        if (this.player == -1)
		{
			// this.model.rotateZ(Math.PI);
			this.model.rotateY(Math.PI / 2);
			this.model.rotateY(Math.PI / 4);
		}
		else
		{
			this.model.rotateZ(Math.PI);
			this.model.rotateY(-Math.PI / 2);
			this.model.rotateY(Math.PI / 4);
		}

        this.scene.add(this.model);
        
        // shadow
        const shadowGeometry = new THREE.CircleGeometry(1, 32);
        const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadow.position.set(this.x, 0.015, this.z);
        this.shadow.rotateX(Math.PI / 2);
        this.scene.add(this.shadow);

        // collision
        this.boundingBox = new THREE.Box3().setFromObject(this.model);
		// const geometry = new THREE.BoxGeometry(5, 2.5, 10);
		// const material = new THREE.MeshBasicMaterial({ color: this.color });
		// this.object = new THREE.Mesh(geometry, material);
		// this.object.position.set(this.x, this.y, this.z);
		// this.scene.add(this.object);

		// this.boundingBox = new THREE.Box3().setFromObject(this.object);
	}

	send(ws, info, content) {
		// console.log("sending it...");
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
