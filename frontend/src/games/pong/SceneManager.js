import * as THREE from 'three';

export class SceneManager {
    constructor(player) {
        // scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.set(90 * player, 60, 0);
        this.camera.lookAt(0, 0, 0);
        
        //rederer
		this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#pong") });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true; // Enable shadow maps in the renderer
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: Use soft shadows

        // lighting
        // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        // this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(-20, 20, 0); // Adjust the x, y, z values to position the light above and in front of the table
        directionalLight.castShadow = true; // Enable shadow casting
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100; // Adjust based on your scene
        directionalLight.shadow.camera.left = -100; // Adjust to cover the area
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.radius=0.5;
        directionalLight.shadow.blurSamples=3;
        this.scene.add(directionalLight);
        
        // const spotLight = new THREE.SpotLight(0xffffff, 10000);
        // spotLight.position.set(-15, 20, 0);
        // spotLight.penumbra = 0.4;
        // spotLight.castShadow = true;
        // this.scene.add(spotLight);
        // const helperSpot = new THREE.SpotLightHelper(spotLight, 0xffffff);
        // this.scene.add(helperSpot);
        
        
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight1.position.set(20, 20, 0); // Adjust the x, y, z values to position the light above and in front of the table
        directionalLight1.castShadow = true; // Enable shadow casting
        directionalLight1.shadow.camera.near = 0.5;
        directionalLight1.shadow.camera.far = 100; // Adjust based on your scene
        directionalLight1.shadow.camera.left = -100; // Adjust to cover the area
        directionalLight1.shadow.camera.right = 100;
        directionalLight1.shadow.camera.top = 100;
        directionalLight1.shadow.camera.bottom = -100;
        directionalLight1.shadow.radius=0.5;
        directionalLight1.shadow.blurSamples=3;
        // directionalLight.shadow.bias = -0.01; // Try small negative values to reduce artifacts

        this.scene.add(directionalLight1);


        // helpers
        const gridHelper = new THREE.GridHelper(200, 50);
        const axesHelper = new THREE.AxesHelper(150);
        this.scene.add(gridHelper);
        this.scene.add(axesHelper);
    }
	cleanUp() {
	
	}
}

export default SceneManager;
