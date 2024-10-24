import * as THREE from 'three';

export class SceneManager {
    constructor(player) {
        // scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x9b0422);

        // camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.set(90 * player, 45, 0);
        this.camera.lookAt(0, 0, 0);
        
        //rederer
		this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#pong") });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // lighting
        const ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambientLight);
        // helpers
        const gridHelper = new THREE.GridHelper(200, 50);
        const axesHelper = new THREE.AxesHelper(15);
    }
	cleanUp() {
	
	}
}

export default SceneManager;
