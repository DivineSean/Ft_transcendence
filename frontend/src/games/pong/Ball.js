import * as THREE from 'three';

const G = 0.0009;

class Ball {
	constructor(scene) {
		this.scene = scene;
		this.boundingSphere = undefined;
		this.object = undefined;

		this.x = 0;
		this.y = 20;
		this.z = 20;

		this.dx = 0;
		this.dy = 0;
		this.dz = 0;
	}

	update(net, table, player1, player2, ws, dt) {

		// Gravity
		this.dz -= G;
		if (this.boundingSphere.intersectsBox(table.boundingBox)) {
			this.z = table.boundingBox.max.z + 1;
			this.dz *= -0.8;
		}

		// Paddles
		if (this.boundingSphere.intersectsBox(player1.boundingBox))
			player1.hit(this, ws);
		if (this.boundingSphere.intersectsBox(player2.boundingBox))
			player2.hit(this, ws);

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
