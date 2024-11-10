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
        const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const base = new THREE.Mesh(baseGeometry, lineMaterial);
        base.rotateX(Math.PI / 2);
        base.receiveShadow = true;
        this.boundingBox = new THREE.Box3().setFromObject(base);
        this.scene.add(base);
        
        // Create blue border fields
        const borderHeight = (W - 2) / 2;
        this.createBorder(0, 0.01, 12, L - 2, borderHeight); // Left border
        this.createBorder(0, 0.01, -12, L - 2, borderHeight); // Right border
        
        // Create the shadow
        const shadowGeometry = new THREE.PlaneGeometry(L, W);
        const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0xcffffff, side: THREE.DoubleSide });
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.rotateX(Math.PI / 2);
        shadow.position.set(0, 0, 0);
        this.scene.add(shadow);
        
        // Create the walls
        this.createWall(-L / 2, -0.5, 0, W, 1, true); // Back wall
        this.createWall(L / 2, -0.5, 0, W, 1, true);  // Front wall
        this.createWall(0, -0.5, -W / 2, L, 1, false); // Right wall
        this.createWall(0, -0.5, W / 2, L, 1, false);  // Left wall
    }
    
    createBorder(x, y, z, width, height) {
        const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x00008E, side: THREE.DoubleSide });
        const borderGeometry = new THREE.PlaneGeometry(width, height);
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(x, y, z);
        border.rotateX(Math.PI / 2);
        border.receiveShadow = true; // Make sure to set this for borders if needed
        // border.castShadow = true;
        this.scene.add(border);
    }
    
    
    createWall(x, y, z, width, height, rotate) {
        const wallGeometry = new THREE.PlaneGeometry(width, height);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x000039, side: THREE.DoubleSide });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        if (rotate === true)
            wall.rotateY(Math.PI / 2); // Rotate to stand vertically
        wall.position.set(x, y, z); // Adjust position
        wall.receiveShadow = true;
        this.scene.add(wall);
    }
}
export default Table;
