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
		// this.y = 6;
		this.y = 5;
		this.z = -12;

		this.dx = 0;
		this.dy = 0;
		this.dz = 0;
	}

	serve(ws, net, sign) {
		this.x = 36 * sign;
		// this.y = 6;
		this.y = 5;
		this.z = -12 * sign;

		this.dx = 0;
		this.dy = 0;
		this.dz = 0;

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
				}
			}
		}
		ws.send(JSON.stringify(data));
	}

	update(net, table, player1, ws, dt, player, keyboard) {
		if (!this.model || !net.boundingBox || !this.boundingSphere || !player1.boundingBox)
			return;
		this.dy -= G;

		//serve 
		if (this.y < -36 && this.x < 0 && player === 2) this.serve(ws, net, 1);
		else if (this.y < -36 && this.x > 0 && player === 1) this.serve(ws, net, -1);

		// Gravity
		if (this.boundingSphere.intersectsBox(table.boundingBox)) {
			this.y = table.boundingBox.max.y + 1;
			this.dy *= -0.5;
		}
		if (this.boundingSphere.intersectsBox(net.boundingBox)) {
			this.dx = Math.min(Math.abs(this.dx) + 0.05, 0.01);
			if (player === 2) {
				this.x = net.boundingBox.min.x - 1;//-0.5
				this.dx *= -1;
			} else {
				this.x = net.boundingBox.max.x + 1;//0.5
			}
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
					}
				}
			}
			ws.send(JSON.stringify(data));
		}
		// Paddles
		if (this.boundingSphere.intersectsBox(player1.boundingBox) && player1.rotating) {
			player1.shoot(net, keyboard, this, dt);
		}
		else if (this.boundingSphere.intersectsBox(player1.boundingBox) && !player1.rotating) {
			player1.hit(this, ws);
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
		// collision 
		this.boundingSphere = new THREE.Sphere(this.model.position, 0.5);
		this.scene.add(this.model);

	}
}

export default Ball;
