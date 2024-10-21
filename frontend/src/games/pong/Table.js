import * as THREE from 'three';

class Table {
	constructor(scene) {
		this.scene = scene;
		this.boundingBox = undefined;
	}

	update() {

	}

	render() {
		const geometry = new THREE.BoxGeometry(50, 100, 10);
		const material = new THREE.MeshBasicMaterial({ color: 0x22ff22 });
		const table = new THREE.Mesh(geometry, material);
		this.scene.add(table);

		this.boundingBox = new THREE.Box3().setFromObject(table);
	}
}

export default Table;
