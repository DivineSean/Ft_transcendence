import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js'

// const manager = new THREE.LoadingManager(() => {
// 	const loading = document.getElementById('loading');
// 	loading.addEventListener('transtionend', loading.remove());
// })

export const bmo3DModel = (canvas, modelFolderName) => {

	const canvasHeight = canvas.clientHeight
	const canvasWidth = canvas.clientWidth

	//scene camera renderer
	const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true})
	renderer.setSize(canvasWidth, canvasHeight)
	renderer.outputColorSpace = THREE.SRGBColorSpace
	renderer.setPixelRatio(window.devicePixelRatio)

	const scene = new THREE.Scene()

	const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 1, 1000)
	camera.position.set(0, 2, 0)
	// camera.lookAt(0, 0, 0);

	//controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.enablePan = false;
	controls.minDistance = 9;
	controls.maxDistance = 2.4;
	controls.minPolarAngle = 0.6;
	controls.maxPolarAngle = 0.6;
	controls.autoRotate = false;
	controls.target = new THREE.Vector3(0, 0, 0);

	//lights
	const light = new THREE.AmbientLight(0xffffff, 0.5)
	scene.add(light)

	const topLight = new THREE.SpotLight(0xffffff, 2000)
	topLight.position.set(-10, 25, 0)
	topLight.castShadow = true;
	scene.add(topLight)

	const downLight = new THREE.SpotLight(0xffffff, 2000)
	downLight.position.set(10, 25, 10)
	scene.add(downLight)

	// const rightBehindLight = new THREE.SpotLight(0xffffff, 2000)
	// rightBehindLight.position.set(25, 0, -25);
	// scene.add(rightBehindLight)

	// const leftBehindLight = new THREE.SpotLight(0xffffff, 2000)
	// leftBehindLight.position.set(-25, 0, -25)
	// scene.add(leftBehindLight)

	const loader = new GLTFLoader();
	loader.load('bmo/scene.gltf', (gltf) => {
			const mesh = gltf.scene;
			scene.add(mesh);
		},
		undefined,
		(error) => {
			console.error('An error occurred while loading the GLTF model:', error);
		}
	)

	function animate() {
		requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene, camera);
	}

	animate();
}