import * as THREE from 'three';

const G = 0.0009;
const MAX_POINTS = 180;

class Ball {
	constructor(scene) {
        this.scene = scene;
        this.model = undefined;
        this.shadow = undefined;
        this.boundingSphere = undefined;

        this.x = 36;
        this.y = 6;
        this.z = -12;

        this.dx = 0;
        this.dy = 0;
        this.dz = 0;
	}

	serve(ws, sign)
	{
		this.x = 36 * sign;
		this.y = 6;
		this.z = -12 * sign;
		
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
        if (!this.model || !net.boundingBox)
            return;
		this.dy -= G;

		//serve 
		if (this.y < -36 && this.x < 0 && player === 2) this.serve(ws, 1);
		else if (this.y < -36 && this.x > 0 && player === 1) this.serve(ws, -1);

		// Gravity
		if (this.boundingSphere.intersectsBox(table.boundingBox)) {
			this.y = table.boundingBox.max.y + 1;
			this.dy *= -0.8;
		}
		else if (this.boundingSphere.intersectsBox(net.boundingBox)) {
			//reset the ball and the player who hit the net lost
		}

		// Paddles
		if (this.boundingSphere.intersectsBox(player1.boundingBox)) {
			player1.hit(net, this, ws);
		}


		// Movement
		this.x += this.dx * dt;
		this.y += this.dy * dt;
		this.z += this.dz * dt;

		this.model.position.set(this.x, this.y, this.z);
		this.boundingSphere.set(this.model.position, 1);
		
	}

	render() {
        // ball
        const ballGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xfcb404 });
        this.model = new THREE.Mesh(ballGeometry, ballMaterial);
		this.model.castShadow = true;
        this.model.position.set(this.x, this.y, this.z);
        this.scene.add(this.model);
        
        // collision 
        this.boundingSphere = new THREE.Sphere(this.model.position, 0.5);
	}
}

export default Ball;
