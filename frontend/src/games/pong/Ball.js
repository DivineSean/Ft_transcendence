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
		this.radius = 0;

        this.x = 42;
        // this.y = 6;
		this.y = -23.5;
        this.z = -20;

		this.dx = 0;
		this.dy = 0;
		this.dz = 0;

		this.count = 0;
		this.serving = true;
		this.lastshooter = 1;
		this.sendLock = false;
	}

	serve(ws,net, sign)
	{
		this.x = 42 * sign;
		// this.y = 6;
		this.y = net.boundingBox.max.y;
		this.z = -20 * sign;
		
		this.dx = 0;
		this.dy = 0;
		this.dz = 0;
		this.count = 0;
		this.serving = true;
		this.lastshooter = sign;
		this.sendLock = false;
	}


	sendScore(ws)
	{
		const data = { 'type': 'score', 'message':{} }
		ws.send(JSON.stringify(data));
	}

	update(net, table, player1, ws, dt, player, keyboard) {
        if (!this.model || !net.boundingBox || !table.boundingBoxTable || !this.boundingSphere || !player1.boundingBox)
            return;
		this.dy -= G;
		let flag = false;
		//serve 
		if (this.y < -50) {
			if (this.lastshooter === 1 && player === 2 && this.sendLock === false)
			{
				this.sendScore(ws);
				this.sendLock = true;
			}
			else if (this.lastshooter === -1 && player === 1 && this.sendLock === false)
			{
				this.sendScore(ws);
				this.sendLock = true;
			}
			else
			{
				console.log(`lastshooter ${this.lastshooter}`);
				console.log(`im player ${player} waiting for the player ${player} to score`);
			}
		}
		else if (this.boundingSphere.intersectsBox(table.boundingBoxTable)) {
			this.y = table.boundingBoxTable.max.y + 1;
			// console.log(this.dy);
			this.dy *= -0.6;
			if (this.sendLock === false)
			{
				if (this.x < 0)
					this.lastshooter = -1;
				else
					this.lastshooter = 1;
				if (this.serving === false)
					this.count += 1;
				if (this.count === 2)
				{
					if (this.x < 0 && player === 1) {this.sendScore(ws); this.sendLock = true; this.serving = true;}
					else if (this.x > 0 && player === 2) {this.sendScore(ws); this.sendLock = true; this.serving = true;}
				}
			}
		}
		if (this.boundingSphere.intersectsBox(net.boundingBox)) {	
			player1.netshoot(this, net, ws, player);
			flag = true;
		}
		// Paddles
		if (this.boundingSphere.intersectsBox(player1.boundingBox) && player1.rotating) {
			this.serving = false;
			this.lastshooter = player1.player;
			player1.shoot(net, keyboard, this, dt);
			this.count = 0;
			flag = true;
		}
		else if (this.boundingSphere.intersectsBox(player1.boundingBox) && !player1.rotating)
		{
			if (!this.serving)
			{
				this.count = 0;
				this.lastshooter = player1.player;
				player1.hit(this, ws);
				flag = true;
			}
		}

		if (flag)
		{
			const data = {
				'type': 'update',
				'message': {
					'content': 'ball',
					'ball': {
						x: this.x,
						y: this.y,
						z: this.z,
						dx: this.dx,
						dy: this.dy,
						dz: this.dz,
						dt: dt,
						serving: this.serving,
						lstshoot: this.lastshooter,
					}
				}
			}
			ws.send(JSON.stringify(data));
		}
		// Movement
		this.x += this.dx * dt;
		this.y += this.dy * dt;
		this.z += this.dz * dt;
		

		this.model.position.set(this.x, this.y, this.z);
		const box = new THREE.Box3().setFromObject(this.model);
		const center = box.getCenter(new THREE.Vector3());
		this.radius = box.getSize(new THREE.Vector3()).length() / 2;
		this.boundingSphere = new THREE.Sphere(center, this.radius - 0.5);	
	}

	updatePos()
	{
		this.model.position.set(this.x , this.y, this.z);
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
		this.radius = box.getSize(new THREE.Vector3()).length() / 2;
		this.boundingSphere = new THREE.Sphere(center, this.radius);
	}
}

export default Ball;
