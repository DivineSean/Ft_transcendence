import * as THREE from 'three';

const G = 0.0009;
const MAX_POINTS = 180;

class Ball {
	constructor(scene) {
        this.scene = scene;
        this.model = undefined;
        this.shadow = undefined;
        this.boundingSphere = undefined;

		this.x = 24;
		this.y = 5;
		this.z = 5;

		this.dx = 0;
		this.dy = 0;
		this.dz = 0;
	}

	update(net, table, player1, player2, ws, dt, player) {
        if (!this.model || !net.boundingBox)
            return;
		if (this.y < -0.3) //reset the ball BUGGGGGGG EVERYWHERE*********
		{
			this.x = 24;
			this.y = 5;
			this.z = 5;
	
			this.dx = 0;
			this.dy = 0;
			this.dz = 0;
			this.model.position.set(this.x, this.y, this.z);
		}
		// Gravity
		this.dy -= G;
		if (this.boundingSphere.intersectsBox(table.boundingBox)) {
			this.y = table.boundingBox.max.y + 1;
			this.dy *= -0.8;
		}
		else if (this.boundingSphere.intersectsBox(net.boundingBox)) {
			//reset the ball and the player who hit the net lost
		}


		// Paddles
		if (player == 1 && this.boundingSphere.intersectsBox(player1.boundingBox)) {
			console.log('player1: ', player1.boundingBox);
			player1.hit(net, this, ws);
		}
		if (player == 2 && this.boundingSphere.intersectsBox(player2.boundingBox)) {
			console.log('player2: ', player2.boundingBox);
			player2.hit(net, this, ws);
		}

		// Movement
		this.x += this.dx * dt;
		this.y += this.dy * dt;
		this.z += this.dz * dt;

		this.model.position.set(this.x, this.y, this.z);

		let shadowScale = (25 - this.y) / 25;
        this.shadow.scale.set(shadowScale, shadowScale, shadowScale);
        this.shadow.position.set(this.x, 0.015, this.z);

		// recalculate boundingSphere
		this.boundingSphere.set(this.model.position, 1);

	}

	render() {
        // ball
        const ballGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xfcb404 });
        this.model = new THREE.Mesh(ballGeometry, ballMaterial);
        this.model.position.set(this.x, this.y, this.z);
        this.scene.add(this.model);
        
        // shadow
        const shadowGeometry = new THREE.CircleGeometry(0.8, 32);
        const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x9a7208, side: THREE.DoubleSide });
        this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadow.position.set(this.x, 0.015, this.z);
        this.shadow.rotateX(Math.PI / 2);
        this.scene.add(this.shadow);
        
        // collision 
        this.boundingSphere = new THREE.Sphere(this.model.position, 0.5);
	}
}

export default Ball;
