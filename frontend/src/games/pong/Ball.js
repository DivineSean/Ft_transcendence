import * as THREE from 'three';

const G = 0.0009;

class Ball {
	constructor(scene) {
		this.scene = scene;
		this.boundingSphere = undefined;
		this.object = undefined;

		this.x = 24;
		this.y = 5;
		this.z = 5;

		this.dx = 0;
		this.dy = 0;
		this.dz = 0;
	}

	update(net, table, player1, player2, ws, dt, player) {

		// Gravity
		this.dy -= G;
		if (this.boundingSphere.intersectsBox(table.boundingBox)) {
			this.y = table.boundingBox.max.y + 1;
			this.dy *= -0.8;
		}

		// Paddles
		if (player == 1 && this.boundingSphere.intersectsBox(player1.boundingBox)) {

			console.log('player1: ', player1.boundingBox);
			player1.hit(this, ws);
		}
		if (player == 2 && this.boundingSphere.intersectsBox(player2.boundingBox)) {

			console.log('player2: ', player2.boundingBox);
			player2.hit(this, ws);
		}

		// Movement
		this.x += this.dx * dt;
		this.y += this.dy * dt;
		this.z += this.dz * dt;

		this.object.position.set(this.x, this.y, this.z);

		// recalculate boundingSphere
		this.boundingSphere.set(this.object.position, 1);

	}

	render() {
		const geometry = new THREE.SphereGeometry(1);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		this.object = new THREE.Mesh(geometry, material);
		this.object.position.set(this.x, this.y, this.z);
		this.scene.add(this.object);

		this.boundingSphere = new THREE.Sphere(this.object.position, 1);
	}
}

export default Ball;
