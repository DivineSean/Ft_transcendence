import * as THREE from 'three';

export class SceneManager {
    constructor(player, loader) {
        // Camera
        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(60 * player, 45, 0);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#pong") });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true; // Enable shadow maps in the renderer
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows (optional)
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.8;

        // Scene
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0x000000); // This will be set to the HDRI later
        this.loader = loader;

        // Lighting (Directional Lights)

        // const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        // directionalLight.position.set(-20, 20, 0);
        // directionalLight.castShadow = true;
        // directionalLight.shadow.camera.near = 0.5;
        // directionalLight.shadow.camera.far = 100;
        // directionalLight.shadow.camera.left = -100;
        // directionalLight.shadow.camera.right = 100;
        // directionalLight.shadow.camera.top = 100;
        // directionalLight.shadow.camera.bottom = -100;
        // directionalLight.shadow.radius = 0.5;
        // directionalLight.shadow.blurSamples = 3;
        // this.scene.add(directionalLight);

        // const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
        // directionalLight1.position.set(20, 20, 0);
        // directionalLight1.castShadow = true;
        // directionalLight1.shadow.camera.near = 0.5;
        // directionalLight1.shadow.camera.far = 100;
        // directionalLight1.shadow.camera.left = -100;
        // directionalLight1.shadow.camera.right = 100;
        // directionalLight1.shadow.camera.top = 100;
        // directionalLight1.shadow.camera.bottom = -100;
        // directionalLight1.shadow.radius = 0.5;
        // directionalLight1.shadow.blurSamples = 3;
        // this.scene.add(directionalLight1);

        const directionalLight3 = new THREE.DirectionalLight(0xffffff, 5);
        directionalLight3.position.set(20, 20, -20);
        directionalLight3.castShadow = true;
        directionalLight3.shadow.camera.near = 0.5;
        directionalLight3.shadow.camera.far = 100;
        directionalLight3.shadow.camera.left = -100;
        directionalLight3.shadow.camera.right = 100;
        directionalLight3.shadow.camera.top = 100;
        directionalLight3.shadow.camera.bottom = -100;
        directionalLight3.shadow.radius = 0.5;
        directionalLight3.shadow.blurSamples = 3;
        this.scene.add(directionalLight3);

        const directionalLight4 = new THREE.DirectionalLight(0xffffff, 5);
        directionalLight4.position.set(-20, 20, 20);
        directionalLight4.castShadow = true;
        directionalLight4.shadow.camera.near = 0.5;
        directionalLight4.shadow.camera.far = 100;
        directionalLight4.shadow.camera.left = -100;
        directionalLight4.shadow.camera.right = 100;
        directionalLight4.shadow.camera.top = 100;
        directionalLight4.shadow.camera.bottom = -100;
        directionalLight4.shadow.radius = 0.5;
        directionalLight4.shadow.blurSamples = 3;
        this.scene.add(directionalLight4);
    }
    
    createWall(x, y, z, width, height, rotate) {
        const wallGeometry = new THREE.PlaneGeometry(width, height);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x000039, side: THREE.DoubleSide});
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        if (rotate === true)
            wall.rotateY(Math.PI / 2); // Rotate to stand vertically
        wall.position.set(x, y, z); // Adjust position
        wall.receiveShadow = true;
        this.scene.add(wall);
    }

    createWall_(x, y, z, width, height) {
        const wallGeometry = new THREE.PlaneGeometry(width, height);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x000039, side: THREE.DoubleSide});
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.rotateX(Math.PI / 2); // Rotate to stand vertically
        wall.position.set(x, y, z); // Adjust position
        wall.receiveShadow = true;
        this.scene.add(wall);
    }

    render() {
        this.createWall(100, 0, 0, 200, 110, true); 
        this.createWall(-100, 0, 0, 200, 110, true); 
        this.createWall(0, 0, 100, 200, 110, false); 
        this.createWall(0, 0, -100, 200, 110, false); 
        this.createWall_(0, 55, 0, 200, 200);
        this.createWall_(0, -55, 0, 200, 200);

    }


    cleanUp() {
    }
}

export default SceneManager;

