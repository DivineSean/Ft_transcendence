import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Net {
  constructor(scene, loader) {
    this.scene = scene;
    this.loader = loader;
    this.model = undefined;
    this.boundingBox = undefined;
    this.x = 0;
    this.y = -26;
    this.z = 0;
  }

  async render() {
    this.model = await this.loader
      .loadAsync(
        `https://${window.location.hostname}:3000/src/games/pong/net.glb`,
      )
      .then((data) => data.scene.children[0]);

    this.model.position.set(this.x, this.y, this.z);
    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true; // Enable shadow casting
        child.receiveShadow = true; // Typically, nets don’t receive shadows
      }
    });
    this.scene.add(this.model);
    const min = new THREE.Vector3(-0.5, -29, -27);
    const max = new THREE.Vector3(0.5, -23.5, 27);
    this.boundingBox = new THREE.Box3(min, max);

    // this.boundingBox = new THREE.Box3().setFromObject(this.model);
    // this.boundingBox.y.max -= 0.2;
    const help = new THREE.Box3Helper(this.boundingBox, 0x008039);
    this.scene.add(help);
  }
}
export default Net;
