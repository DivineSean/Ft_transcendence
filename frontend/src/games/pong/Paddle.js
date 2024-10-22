import * as THREE from 'three';

class Paddle {
	constructor(scene, player, position, controls, color) {
		this.scene = scene;
		this.player = player;
		this.controls = controls;
		this.color = color;
		this.object = undefined;

		this.boundingBox = undefined;

		this.x = position.x;
		this.y = position.y;
		this.z = position.z;

		this.dx = 0.0;
		this.dy = 0.0;
		this.dz = 0.0;
	}

	update(keyboard, ball, ws, dt) {

		// recalculate boundingBox
		this.boundingBox.setFromObject(this.object);

		// apply friction
		this.dx *= 0.8;
		this.dy *= 0.8;
		this.dz *= 0.8;

		// console.log(keyboard);
		if (keyboard[this.controls.left]) this.dx += 0.008 * this.player;
		if (keyboard[this.controls.right]) this.dx -= 0.008 * this.player;
		if (keyboard[this.controls.down]) this.dy += 0.008 * this.player;
		if (keyboard[this.controls.up]) this.dy -= 0.008 * this.player;

		this.x = this.x + this.dx * dt;

		if (this.player == -1)
			this.y = Math.min(this.y + this.dy * dt, -5);
		else
			this.y = Math.max(this.y + this.dy * dt, 5);

		this.object.position.set(this.x, this.y, this.z);

		if (Math.abs(this.dx) > 0.001
			|| Math.abs(this.dy) > 0.001) // send new position as long as the ball is moving
			this.send(ws, 'paddle', {
				x: this.x,
				y: this.y,
				z: this.z,
			});
	}

	hit(ball, ws) {
		// console.log("hit them balls");

		ball.y = this.player == -1 ? this.boundingBox.max.y : this.boundingBox.min.y;
		ball.y -= this.player;
		// ball.z = Math.min(ball.z, 50);

		console.log('Damn son: ', ball.dy);
		ball.dy = Math.min(ball.dy + this.player * 0.05, 0.02);
		ball.dy *= -0.8;
		// ball.dz += 0.03;
		// ball.dz *= -0.8;

		// this.send(ws, 'ball', {
		// 	x: ball.x,
		// 	y: ball.y,
		// 	z: ball.z,
		// 	dx: ball.dx,
		// 	dy: ball.dy,
		// 	dz: ball.dz,
		// });
	}

	updatePos() {
		this.object.position.set(this.x, this.y, this.z);
		this.boundingBox.setFromObject(this.object);
	}

	render() {
		const geometry = new THREE.BoxGeometry(25, 5, 5);
		const material = new THREE.MeshBasicMaterial({ color: this.color });
		this.object = new THREE.Mesh(geometry, material);
		this.object.position.set(this.x, this.y, this.z);
		this.scene.add(this.object);

		this.boundingBox = new THREE.Box3().setFromObject(this.object);
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
