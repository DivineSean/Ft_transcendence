import * as THREE from "three";

export class Table {
	constructor(scene, loader) {
		this.scene = scene;
		this.boundingBoxTable = undefined;
        this.boundingmidTable = undefined;
        this.boundingendTable = undefined;
        this.table = undefined;
        this.midtable = undefined;
        this.endtable = undefined;
        this.loader = loader;
	}

	update() {

	}

    async render() {
        this.table = await this.loader.loadAsync(`https://${window.location.hostname}:3000/src/games/pong/table.glb`)
            .then(data => data.scene.children[0]);

        this.table.position.set(0, -28.5, 0);
        // this.table.position.set(0, 0, 0);
        this.table.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true; // Enable shadow casting   
                child.receiveShadow = true; // Typically, nets don’t receive shadows
            }
        });
        this.boundingBoxTable = new THREE.Box3().setFromObject(this.table);
        this.scene.add(this.table);

        //mid table
        this.midtable = await this.loader.loadAsync(`https://${window.location.hostname}:3000/src/games/pong/midtable.glb`)
        .then(data => data.scene.children[0]);

        this.midtable.position.set(28, -39, -23);
        this.midtable.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true; // Enable shadow casting   
                child.receiveShadow = true; // Typically, nets don’t receive shadows
            }
        });
        this.boundingBoxmidTable = new THREE.Box3().setFromObject(this.midtable);
        this.scene.add(this.midtable);
        //endtable
        
        this.endtable = await this.loader.loadAsync(`https://${window.location.hostname}:3000/src/games/pong/endtable.glb`)
        .then(data => data.scene.children[0]);

        this.endtable.position.set(-24, -51.5, -21.5);
        this.endtable.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true; // Enable shadow casting   
                child.receiveShadow = true; // Typically, nets don’t receive shadows
            }
        });
        this.boundingendTable = new THREE.Box3().setFromObject(this.endtable);
        this.scene.add(this.endtable);
    }
}
export default Table;
