import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
export class Net {
    constructor(scene, loader) {
        this.scene = scene;
        this.loader = loader;
        this.model = undefined;
        this.boundingBox = undefined;
    }

    async render() {
        this.model = await this.loader.loadAsync("https://localhost:3000/src/games/pong/net.glb")
            .then(data => data.scene.children[0]);
        this.model.position.set(0, 2.75, 0);
        // this.model.scale.set(2.15, 2.15, 2.15); // Scale x (width), y (height), z (depth)
        this.scene.add(this.model);
 
        const min = new THREE.Vector3(-0.5, 0, -26);
        const max = new THREE.Vector3(0.5, 4.75, 26);
        this.boundingBox = new THREE.Box3(min, max);
    }
}
export default Net;