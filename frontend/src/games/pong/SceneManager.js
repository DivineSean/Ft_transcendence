import * as THREE from 'three';

class SceneManager {
	constructor(player) {

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x9b0422);

		this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#pong") });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);

		// camera
		this.camera = new THREE.PerspectiveCamera(
			60, // FOV
			// window.innerWidth / window.innerHeight, // Perspective
			1,
			1, // near Plane
			1000 // far Plane
		);

		this.camera.up.set(0, 0, 1);
		this.camera.position.set(0, 60 * player, 90);
		this.camera.lookAt(0, 0, 0);

		// lighting
		// const ambientLight = new THREE.AmbientLight(0xffffff);
		// this.scene.add(ambientLight);
	}

	cleanUp() {

	}
}

export default SceneManager;
