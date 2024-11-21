import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class SceneManager {
    constructor(player) {
        // Camera
        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.position.set(90 * player, 20, 0);
        // this.camera.position.set(90 * player, -24, 0);//9dam
        // this.camera.position.set(0 * player, -24, 90);//jenb
        this.camera.lookAt(0, -28.5, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#pong") });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true; // Enable shadow maps in the renderer
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows (optional)


        // this.renderer.shadowMap.type = THREE.VSMShadowMap;   
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.8;


        // Add OrbitControls for camera manipulation
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;  // Optional, for smooth camera movement
        controls.dampingFactor = 0.25;  // Optional, controls the speed of damping
        controls.screenSpacePanning = false; 


        // Scene
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0x000000); // This will be set to the HDRI later

        // Lighting (Directional Lights)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-80, 20, -45); // Position it above the room
        directionalLight.target.position.set(0, -25.5, 0); // P
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;  // Shadow map width (increase for higher resolution)
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        directionalLight.shadow.radius = 0.5;
        directionalLight.shadow.blurSamples = 3;
        this.scene.add(directionalLight);


        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight1.position.set(80, 20, 45); // Position it above the room
        directionalLight1.target.position.set(0, -25.5, 0); // P
        directionalLight1.castShadow = true;
        directionalLight1.shadow.mapSize.width = 2048;  // Shadow map width (increase for higher resolution)
        directionalLight1.shadow.mapSize.height = 2048;
        directionalLight1.shadow.camera.near = 0.5;
        directionalLight1.shadow.camera.far = 200;
        directionalLight1.shadow.camera.left = -200;
        directionalLight1.shadow.camera.right = 200;
        directionalLight1.shadow.camera.top = 200;
        directionalLight1.shadow.camera.bottom = -200;
        directionalLight1.shadow.radius = 0.5;
        directionalLight1.shadow.blurSamples = 3;
        this.scene.add(directionalLight1);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
        const lightHelper1 = new THREE.DirectionalLightHelper(directionalLight1, 5);

        this.scene.add(lightHelper);
        this.scene.add(lightHelper1);

        // const gridHelper = new THREE.GridHelper(200, 50);
        const axesHelper = new THREE.AxesHelper(1500);
        // this.scene.add(gridHelper);
        this.scene.add(axesHelper);

    }
    
    createWall(x, y, z, width, height, rotate, pointLight) {
        const wallGeometry = new THREE.PlaneGeometry(width, height);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x000039, side: THREE.DoubleSide});
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        if (rotate === true)
            wall.rotateY(Math.PI / 2); // Rotate to stand vertically
        wall.position.set(x, y, z); // Adjust position
        wall.receiveShadow = true;
        pointLight.target = wall;
        this.scene.add(wall);
    }

    createWall_(x, y, z, width, height, pointLight) {
        const wallGeometry = new THREE.PlaneGeometry(width, height);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x000039, side: THREE.DoubleSide});
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.rotateX(Math.PI / 2); // Rotate to stand vertically
        wall.position.set(x, y, z); // Adjust position
        wall.receiveShadow = true;
        pointLight.target = wall;
        this.scene.add(wall);
    }

    render() {
        // Optional: Adding a point light for more localized highlights or for lighting specific areas (like the center of the room)
        const pointLight = new THREE.PointLight(0xffffff, 100000, 500); // Low intensity, limited range
        pointLight.position.set(0, -150, 0); // Placing in the center of the room
        this.createWall(100, 0, 0, 200, 110, true, pointLight); 
        this.createWall(-100, 0, 0, 200, 110, true, pointLight); 
        this.createWall(0, 0, 100, 200, 110, false, pointLight); 
        this.createWall(0, 0, -100, 200, 110, false, pointLight); 
        this.createWall_(0, 55, 0, 200, 200, pointLight);
        this.createWall_(0, -55, 0, 200, 200, pointLight);
        this.scene.add(pointLight);
    }


    cleanUp() {
    }
}

export default SceneManager;

