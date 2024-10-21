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

		this.x = this.x + this.dx * dt;
		this.object.position.set(this.x, this.y, this.z);

		// if (keyboard[this.controls.left] || keyboard[this.controls.right])
		if (Math.abs(this.dx) > 0.001) // send new position as long as the ball is moving
			this.send(ws);
	}
	updatePos() {
		this.object.position.set(this.x, this.y, this.z);
	}

	render() {
		const geometry = new THREE.BoxGeometry(25, 5, 5);
		const material = new THREE.MeshBasicMaterial({ color: this.color });
		this.object = new THREE.Mesh(geometry, material);
		this.object.position.set(this.x, this.y, this.z);
		this.scene.add(this.object);

		this.boundingBox = new THREE.Box3().setFromObject(this.object);
	}

	send(ws) {
		console.log("sending it...");
		const data = {
			'type': 'update',
			'message': {
				x: this.x,
				y: this.y,
				z: this.z,
			},
		}
		ws.send(JSON.stringify(data));
	}
}

export default Paddle;
