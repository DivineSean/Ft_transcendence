import * as THREE from "three";

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
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    this.scene.add(this.model);
    const min = new THREE.Vector3(-0.5, -29, -27);
    const max = new THREE.Vector3(0.5, -23.5, 27);
    this.boundingBox = new THREE.Box3(min, max);
  }

  RemoveChild(plane) {
    if (!plane) return;
    for (let i = plane.children.length - 1; i >= 0; i--) {
      const child = plane.children[i];
      plane.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
  }

  RemoveMaterial(plane) {
    if (plane) {
      this.RemoveChild(plane);
      this.scene.remove(plane);
      if (plane.geometry) plane.geometry.dispose();
      if (plane.material) plane.material.dispose();
      plane = null;
    }
  }

  cleanup() {
    this.RemoveMaterial(this.model);
  }
}
export default Net;
