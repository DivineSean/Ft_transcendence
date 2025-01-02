import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const manager = new THREE.LoadingManager(() => {
  const loading = document.getElementById("loading");
  if (loading) loading.addEventListener("transtionend", loading.remove());
});

export const create3DModel = async (canvas, modelFolderName) => {
  const canvasHeight = canvas.clientHeight;
  const canvasWidth = canvas.clientWidth;

  //scene camera renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    canvasWidth / canvasHeight,
    1,
    1000,
  );
  camera.position.set(0, 2, 2);
  // camera.lookAt(0, 0, 0);

  //controls
  const controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;
  // controls.enablePan = false;
  // controls.minDistance = 2.5;
  // controls.maxDistance = 2.4;
  // controls.minPolarAngle = 0.5;
  // controls.maxPolarAngle = Math.PI / 2;
	controls.enabled = false;
  // controls.autoRotate = true;
  // controls.target = new THREE.Vector3(0, 0, 0);

  //lights
  // const light = new THREE.AmbientLight(0xffffff, 2)
  // scene.add(light)
  const topLight = new THREE.SpotLight(0xffffff, 2000);
  topLight.position.set(0, 25, 0);
  scene.add(topLight);

  const downLight = new THREE.SpotLight(0xffffff, 2000);
  downLight.position.set(0, -25, 10);
  scene.add(downLight);

  const rightBehindLight = new THREE.SpotLight(0xffffff, 2000);
  rightBehindLight.position.set(25, 0, -25);
  scene.add(rightBehindLight);

  const leftBehindLight = new THREE.SpotLight(0xffffff, 2000);
  leftBehindLight.position.set(-25, 0, -25);
  scene.add(leftBehindLight);

	const loader = new GLTFLoader(manager);

	loader
		.loadAsync(`https://${window.location.hostname}:3000/planet/scene.gltf`)
		.then((gltf) => {
			const mesh = gltf.scene;
			scene.add(mesh);
		})
		.catch((error) => {});

		function animate() {
			// requestAnimationFrame(animate);
			renderer.render(scene, camera);
			controls.update();
		}
		renderer.setAnimationLoop(animate)
			
  // animate();
};
