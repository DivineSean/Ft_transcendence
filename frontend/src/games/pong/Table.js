import * as THREE from "three";

const L = 72; // Length
const W = 48; // Width
const H = 20; // Height of the walls

export class Table {
	constructor(scene) {
		this.scene = scene;
		this.boundingBox = undefined;
	}

	update() {

	}
    render() {
        // Create the white table base
        const baseGeometry = new THREE.PlaneGeometry(L, W);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const base = new THREE.Mesh(baseGeometry, lineMaterial);
        base.rotateX(Math.PI / 2);
        this.scene.add(base);
		this.boundingBox = new THREE.Box3().setFromObject(base);
        
        // Create blue border fields
        const LborderMaterial = new THREE.Mesh(new THREE.PlaneGeometry(L - 2, (W - 2) / 2), new THREE.MeshBasicMaterial({ color: 0x00008E, side: THREE.DoubleSide })); 
        LborderMaterial.position.set(0, 0.01, 12);
        LborderMaterial.rotateX(Math.PI / 2);
        this.scene.add(LborderMaterial);

        const RborderMaterial = new THREE.Mesh(new THREE.PlaneGeometry(L - 2, (W - 2) / 2), new THREE.MeshBasicMaterial({ color: 0x00008E, side: THREE.DoubleSide })); 
        RborderMaterial.position.set(0, 0.01, -12);
        RborderMaterial.rotateX(Math.PI / 2);
        this.scene.add(RborderMaterial);

        // Create the shadow
        const shadowGeometry = new THREE.PlaneGeometry(L, W);
        const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0xcffffff, side: THREE.DoubleSide });
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.rotateX(Math.PI / 2);
        shadow.position.set(0, -1, 0);
        this.scene.add(shadow);

        // Create the walls to enclose the space between the base and the shadow
        this.createWall(-L / 2, -0.5, 0, W, 1, true); // Back wall
        this.createWall(L / 2, -0.5, 0, W, 1, true);  // Front wall
        this.createWall(0, -0.5, -W / 2, L, 1, false);  // Right wall
        this.createWall(0, -0.5, W / 2, L, 1, false);   // Left wall
    }

    createWall(x, y, z, width, height, rotate) {
        const wallGeometry = new THREE.PlaneGeometry(width, height);
        const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x000039, side: THREE.DoubleSide });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        if (rotate === true)
            wall.rotateY(Math.PI / 2); // Rotate to stand vertically
        wall.position.set(x, y, z); // Adjust position
        this.scene.add(wall);
    }
}
export default Table;
