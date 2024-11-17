import * as THREE from 'three';

const G = 0.0009;
const MAX_POINTS = 180;

class Ball {
	constructor(scene, loader, player) {
        this.scene = scene;
        this.model = undefined;
		this.loader = loader;
        this.boundingSphere = undefined;
		this.player = player;

        this.x = 42;
        // this.y = 6;
		this.y = 5;
        this.z = -20;

        this.dx = 0;
        this.dy = 0;
        this.dz = 0;
	}

	serve(ws,net, sign)
	{
		this.x = 42 * sign;
		// this.y = 6;
		this.y = 5;
		this.z = -20 * sign;
		
		this.dx = 0;
		this.dy = 0;
		this.dz = 0;

		const data = {
			'message': {
				'content': 'ball',
				'ball': {
					x: this.x,
					y: this.y,
					z: this.z,
					dx: this.dx,
					dy: this.dy,
					dz: this.dz,
				}
			}
		}
		ws.send(JSON.stringify(data));
	}

	update(net, table, player1, ws, dt, player, keyboard) {
        if (!this.model || !net.boundingBox || !table.boundingBoxTable || !this.boundingSphere || !player1.boundingBox)
            return;
		this.dy -= G;

		//serve 
		if (this.y < -36 && this.x < 0 && player === 2) this.serve(ws, net, 1);
		else if (this.y < -36 && this.x > 0 && player === 1) this.serve(ws, net, -1);

		// Gravity
		if (this.boundingSphere.intersectsBox(table.boundingBoxTable)) {
			this.y = table.boundingBoxTable.max.y + 1;
			// console.log(this.dy);
			this.dy *= -0.6;
		}
		if (this.boundingSphere.intersectsBox(net.boundingBox)) {	
			player1.netshoot(this, net, ws);
		}
		// Paddles
		if (this.boundingSphere.intersectsBox(player1.boundingBox) && player1.rotating) {
			player1.shoot(net, keyboard, this, dt);
		}
		else if (this.boundingSphere.intersectsBox(player1.boundingBox) && !player1.rotating)
		{
			player1.hit(this, ws);
		}


		// Movement
		this.x += this.dx * dt;
		this.y += this.dy * dt;
		this.z += this.dz * dt;

		this.model.position.set(this.x, this.y, this.z);
		const box = new THREE.Box3().setFromObject(this.model);
		const center = box.getCenter(new THREE.Vector3());
		const radius = box.getSize(new THREE.Vector3()).length() / 2;
		this.boundingSphere = new THREE.Sphere(center, radius - 0.5);

		// this.boundingSphere.set(this.model.position.center, this.model.position.radius + 0.5);
		
	}

	updatePos()
	{
		this.model.position.set(this.x, this.y, this.z);
		const box = new THREE.Box3().setFromObject(this.model);
		const center = box.getCenter(new THREE.Vector3());
		const radius = box.getSize(new THREE.Vector3()).length() / 2;
		this.boundingSphere = new THREE.Sphere(center, radius - 0.5);
	}

	async render() {
		this.model = await this.loader.loadAsync(`https://${window.location.hostname}:3000/src/games/pong/ball.glb`)
			.then(data => data.scene.children[0]);
	
		this.model.position.set(this.x, this.y, this.z);
	
		this.model.traverse(child => {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
	
		this.scene.add(this.model);
	
		// Optional: Dynamic bounding sphere calculation
		const box = new THREE.Box3().setFromObject(this.model);
		const center = box.getCenter(new THREE.Vector3());
		const radius = box.getSize(new THREE.Vector3()).length() / 2;
		this.boundingSphere = new THREE.Sphere(center, radius);
		
		// If you want to visualize the bounding box for debugging
		// const help = new THREE.Box3Helper(box, 0x50C878);
		// this.scene.add(help);
	}
	

		// render() {
		// 	// ball
		// 	const ballGeometry = new THREE.SphereGeometry(0.5, 32, 16);
		// 	const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xfcb404 });
		// 	this.model = new THREE.Mesh(ballGeometry, ballMaterial);
		// 	this.model.castShadow = true;
		// 	this.model.position.set(this.x, this.y, this.z);
		// 	// collision 
		// 	this.boundingSphere = new THREE.Sphere(this.model.position, 0.5);
		// 	this.scene.add(this.model);
		// }
}

export default Ball;
