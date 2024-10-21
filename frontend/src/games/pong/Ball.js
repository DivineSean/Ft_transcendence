import * as THREE from 'three';

class Ball {
	constructor(scene) {
		this.scene = scene;
		this.boundingBox = undefined;

		this.x = 0;
		this.y = 0;
		this.z = 0;

		this.velocity = new THREE.Vector3(0, 0, 0);
	}

	update() {

	}

	render() {
		const geometry = new THREE.SphereGeometry(0.1);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		const ball = new THREE.Mesh(geometry, material);
		ball.position.set(this.x, this.y, this.z);
		this.scene.add(ball);

		this.boundingBox = new THREE.Box3().setFromObject(ball);
	}
}

export default Ball;
