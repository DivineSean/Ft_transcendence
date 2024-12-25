import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

export class SceneManager {
	constructor(player, names, globalMessage, setIsWon, setIslost, setReady) {
		this.player = player;
		this.names = names;
		this.Marathoner = false;
		this.globalMessage = globalMessage;
		this.RemontadaPlayer = player;
		this.RemontadaChance = false;
		this.setIsWon = setIsWon;
		this.setIslost = setIslost;
		this.setReady = setReady;
		// Camera
		this.camera = new THREE.PerspectiveCamera(
			80,
			window.innerWidth / window.innerHeight,
			1,
			1000,
		);
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.position.set(90 * player, 20, 0);
		this.camera.lookAt(0, -28.5, 0);

		// Renderer
		this.renderer = new THREE.WebGLRenderer({
			canvas: document.querySelector("#pong"),
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// this.renderer.shadowMap.type = THREE.VSMShadowMap;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.8;

		// Add OrbitControls for camera manipulation

		const controls = new OrbitControls(this.camera, this.renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.25;
		controls.screenSpacePanning = false;
		controls.enableRotate = false;
		controls.enableZoom = false;
		controls.enablePan = false;
		controls.enabled = false;
		controls.update();

		// Scene
		this.scene = new THREE.Scene();

		this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		this.FixLight(this.directionalLight, -80, 20, -45);

		this.directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
		this.FixLight(this.directionalLight1, 80, 20, 45);

		this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
		this.scene.add(this.ambientLight);

		this.P1Score = undefined;
		this.P2Score = undefined;
		this.P1ScoreBarre = undefined;
		this.P2ScoreBarre = undefined;
		this.P1red = undefined;
		this.P2red = undefined;
		this.P1MatchPoint = undefined;
		this.P2MatchPoint = undefined;
		this.wall1 = undefined;
		this.wall2 = undefined;
		this.wall3 = undefined;
		this.wall4 = undefined;
		this.wall5 = undefined;
		this.wall6 = undefined;
		this.pointLight = undefined;
		this.timerDiv = undefined;


		this.audioLoader = new THREE.AudioLoader();
		this.listener = new THREE.AudioListener();
	}


	FixLight(light, x, y, z)
	{
		light.position.set(x, y, z); // Position it above the room
		light.target.position.set(0, -25.5, 0); // P
		light.castShadow = true;
		light.shadow.mapSize.width = 2048; // Shadow map width (increase for higher resolution)
		light.shadow.mapSize.height = 2048;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 200;
		light.shadow.camera.left = -200;
		light.shadow.camera.right = 200;
		light.shadow.camera.top = 200;
		light.shadow.camera.bottom = -200;
		light.shadow.radius = 0.5;
		light.shadow.blurSamples = 3;
		this.scene.add(light);
	}

	TimerCSS(ball) {
		this.lastTime = Date.now();
		const elapsedTimeInSeconds = Math.floor(
			(this.lastTime - this.startTime) / 1000,
		);
		const minutes = Math.floor(elapsedTimeInSeconds / 60);
		if (!this.Marathoner && minutes === 5) {
			if (!ball.Achievement.isPlaying) {
				ball.Achievement.currentTime = 0;
				ball.Achievement.play();
			}
			this.globalMessage({
				message: "The game doesnt just need you—it thrives because of you!",
				title: "The Marathoner Achieved",
			});
			this.Marathoner = true;
		}
		const seconds = elapsedTimeInSeconds % 60;
		const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
		this.updateTextOnPlane(
			this.timerDiv,
			`${formattedTime}`,
			-0.095,
			0,
			0.05,
			0xffffff,
		);
	}

	createWall(x, y, z, width, height, rotate, pointLight) {
		const wallGeometry = new THREE.PlaneGeometry(width, height);
		const wallMaterial = new THREE.MeshStandardMaterial({
			color: 0x000039,
			side: THREE.DoubleSide,
		});
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		if (rotate === true) wall.rotateY(Math.PI / 2);
		wall.position.set(x, y, z);
		wall.receiveShadow = true;
		pointLight.target = wall;
		this.scene.add(wall);
		return wall;
	}

	createWall_(x, y, z, width, height, pointLight) {
		const wallGeometry = new THREE.PlaneGeometry(width, height);
		const wallMaterial = new THREE.MeshStandardMaterial({
			color: 0x000039,
			side: THREE.DoubleSide,
		});
		const wall = new THREE.Mesh(wallGeometry, wallMaterial);
		wall.rotateX(Math.PI / 2);
		wall.position.set(x, y, z);
		wall.receiveShadow = true;
		pointLight.target = wall;
		this.scene.add(wall);
		return wall;
	}

	updateTextOnPlane(plane, text, x, y, z, color) {
		const loader = new FontLoader();

		loader.load(
			`https://${window.location.hostname}:3000/src/games/pong/Font.json`,
			(font) => {
				plane.children.forEach((child) => {
					if (child.isMesh && child.geometry instanceof TextGeometry) {
						plane.remove(child);
						child.geometry.dispose();
						child.material.dispose();
					}
				});
				const textGeometry = new TextGeometry(text, {
					font: font,
					size: 0.07,
					depth: 0.01,
				});
				const textMaterial = new THREE.MeshBasicMaterial({ color: color });
				const textMesh = new THREE.Mesh(textGeometry, textMaterial);
				textMesh.position.set(x, y, z);
				plane.add(textMesh);
			},
		);
	}

	scoreUpdate(send, P, whoScore, ball) {
		ball.scoreboard[0] = Number(P["1"]);
		ball.scoreboard[1] = Number(P["2"]);
		ball.whoscore = whoScore;
		this.scene.remove(this.P1red);
		this.scene.remove(this.P2red);
		if (whoScore === 1) this.scene.add(this.P1red);
		else if (whoScore === 2) this.scene.add(this.P2red);
		if (P["1"] === "6") {
			this.RemoveMaterial(this.P1MatchPoint);
			this.P1MatchPoint = this.createRoundedPlane(
				0.6,
				0.19,
				0.05,
				0x212d45,
				0.13,
				-(0.82 * this.player),
				false,
				undefined,
			);
			this.P1MatchPoint.position.set(
				this.P1MatchPoint.position.x,
				this.P1MatchPoint.position.y - 0.5,
				this.P1MatchPoint.position.z,
			);
			this.addTextToPlane(this.P1MatchPoint, "Match Point", -0.25, 0, 0xffffff);
		}
		if (P["2"] === "6") {
			this.RemoveMaterial(this.P2MatchPoint);
			this.P2MatchPoint = this.createRoundedPlane(
				0.6,
				0.19,
				0.05,
				0x212d45,
				-0.13,
				-(0.82 * this.player),
				false,
				undefined,
			);
			this.P2MatchPoint.position.set(
				this.P2MatchPoint.position.x,
				this.P2MatchPoint.position.y - 0.5,
				this.P2MatchPoint.position.z,
			);
			this.addTextToPlane(this.P2MatchPoint, "Match Point", -0.25, 0, 0xffffff);
		}
		if (
			(this.player === -1 && P["1"] === "6") ||
			(this.player === 1 && P["2"] === "6")
		) {
			ball.BackgroundMusic.setVolume(0.01);
			if (!ball.ballMatchPoint.isPlaying) {
				ball.ballMatchPoint.currentTime = 0;
				ball.ballMatchPoint.play();
			}
		}
		this.updateTextOnPlane(this.P1ScoreBarre, P["1"], 0, 0, 0.03, 0xffffff);
		this.updateTextOnPlane(this.P2ScoreBarre, P["2"], 0, 0, 0.03, 0xffffff);
		if (P["1"] === "7" || P["2"] === "7") {
			ball.bounceSound.setVolume(0);
			ball.netHitSound.setVolume(0);
			ball.paddleHitSound.setVolume(0);
			ball.onlyHit.setVolume(0);
			ball.swing.setVolume(0);
			ball.scoreSound.setVolume(0);
			ball.BackgroundMusic.setVolume(0);
			ball.lostSound.setVolume(0);
			ball.ballMatchPoint.setVolume(0);
			if (P["1"] === "7") {
				if (this.player === 1) {
					if (!ball.Victory.isPlaying) {
						ball.Victory.currentTime = 0;
						ball.Victory.play();
						if (P["2"] === 0) {
							if (!ball.Achievement.isPlaying) {
								ball.Achievement.currentTime = 0;
								ball.Achievement.play();
							}
							this.globalMessage({
								message:
									"You didnt just win—you sent a message to everyone watching!",
								title: "The Dominator Achieved",
							});
						}
						this.setIsWon(true);
						send(JSON.stringify({
							type: "result",
							message: "win",
						}))
					}
				} else {
					if (!ball.Defeat.isPlaying) {
						ball.Defeat.currentTime = 0;
						ball.Defeat.play();
						this.setIslost(true);
						send(JSON.stringify({
							type: "result",
							message: "loss",
						}))
					}
				}
			} else {
				if (this.player === 1) {
					if (!ball.Defeat.isPlaying) {
						ball.Defeat.currentTime = 0;
						ball.Defeat.play();
						this.setIslost(true);
						send(JSON.stringify({
							type: "result",
							message: "loss",
						}))
					}
				} else {
					if (!ball.Victory.isPlaying) {
						ball.Victory.currentTime = 0;
						ball.Victory.play();
						if (P["1"] === 0) {
							if (!ball.Achievement.isPlaying) {
								ball.Achievement.currentTime = 0;
								ball.Achievement.play();
							}
							this.globalMessage({
								message:
									"You didnt just win—you sent a message to everyone watching!",
								title: "The Dominator Achieved",
							});
						}
						this.setIsWon(true);
						send(JSON.stringify({
							type: "result",
							message: "win",
						}))
					}
				}
			}
			this.setReady(false);
		}
	}

	createRoundedPlane(width, height, radius, clor, y, z, flag, PlayerScore) {
		const shape = new THREE.Shape();
		let c;
		const cameraDirection = new THREE.Vector3();
		let ScoreGeometry;
		// Top-left corner
		if (PlayerScore === undefined) {
			shape.moveTo(-width / 2 + radius, height / 2);
			shape.lineTo(width / 2 - radius, height / 2); // Top edge
			shape.quadraticCurveTo(
				width / 2,
				height / 2,
				width / 2,
				height / 2 - radius,
			); // Top-right corner
			shape.lineTo(width / 2, -height / 2 + radius); // Right edge
			shape.quadraticCurveTo(
				width / 2,
				-height / 2,
				width / 2 - radius,
				-height / 2,
			); // Bottom-right corner
			shape.lineTo(-width / 2 + radius, -height / 2); // Bottom edge
			if (!flag) {
				shape.quadraticCurveTo(
					-width / 2,
					-height / 2,
					-width / 2,
					-height / 2 + radius,
				); // Bottom-left corner
				shape.lineTo(-width / 2, height / 2 - radius); // Left edge
				shape.quadraticCurveTo(
					-width / 2,
					height / 2,
					-width / 2 + radius,
					height / 2,
				); // Top-left corner
			}
			this.camera.getWorldDirection(cameraDirection);
			const distance = 1; // Distance from the camera to the target plane
			const vFOV = THREE.MathUtils.degToRad(this.camera.fov); // Convert vertical FOV to radians
			const cameraHeight = 2 * Math.tan(vFOV / 2) * distance;
			const cameraWidth = cameraHeight * this.camera.aspect;
			c = new THREE.Vector3(
				this.camera.position.x + cameraHeight * this.player + 0.5 * this.player,
				this.camera.position.y - cameraHeight + y,
				this.camera.position.z + cameraWidth * this.player + z,
			); //bot-left
			ScoreGeometry = new THREE.ShapeGeometry(shape);
		} else {
			c = new THREE.Vector3(
				PlayerScore.position.x,
				PlayerScore.position.y + y,
				PlayerScore.position.z + z,
			); //bot-left
			ScoreGeometry = new THREE.PlaneGeometry(width, height);
		}

		// Create geometry from shape
		const ScoreMaterial = new THREE.MeshStandardMaterial({
			color: clor,
		});
		const Score = new THREE.Mesh(ScoreGeometry, ScoreMaterial);

		Score.position.copy(c).add(cameraDirection.multiplyScalar(5));
		Score.quaternion.copy(this.camera.quaternion); //front of the camera directions
		if (PlayerScore && !flag) return Score;
		this.scene.add(Score);
		return Score;
	}

	scoreRender(flag, whoscore) {
		// NameBar
		this.P1Score = this.createRoundedPlane(
			1,
			0.19,
			0.025,
			0xa9eafe,
			0.13,
			0,
			false,
			undefined,
		);
		this.P1Score.position.set(
			this.P1Score.position.x,
			this.P1Score.position.y - 0.5,
			this.P1Score.position.z,
		);
		this.addTextToPlane(this.P1Score, this.names[0], -0.4, 0, 0x000000);

		if (this.player === -1) {
			this.P2Score = this.createRoundedPlane(
				1,
				0.19,
				0.025,
				0xa9eafe,
				-0.13,
				-0.035,
				false,
				undefined,
			);
		} else {
			this.P2Score = this.createRoundedPlane(
				1,
				0.19,
				0.025,
				0xa9eafe,
				-0.13,
				0.045,
				false,
				undefined,
			);
		}
		this.P2Score.position.set(
			this.P2Score.position.x,
			this.P2Score.position.y - 0.5,
			this.P2Score.position.z,
		);
		this.addTextToPlane(this.P2Score, this.names[1], -0.4, 0, 0x000000);

		// ScoreBarre
		this.P1ScoreBarre = this.createRoundedPlane(
			0.2,
			0.19,
			0.025,
			0x212d45,
			0.13,
			-(0.4 * this.player),
			true,
			undefined,
		);
		this.P1ScoreBarre.position.set(
			this.P1ScoreBarre.position.x,
			this.P1ScoreBarre.position.y - 0.5,
			this.P1ScoreBarre.position.z,
		);
		if (flag === undefined)
			this.addTextToPlane(this.P1ScoreBarre, "0", 0, 0, 0xffffff);
		else
			this.addTextToPlane(
				this.P1ScoreBarre,
				flag[0].toString(),
				0,
				0,
				0xffffff,
			);

		if (this.player === -1) {
			this.P2ScoreBarre = this.createRoundedPlane(
				0.2,
				0.19,
				0.025,
				0x212d45,
				-0.13,
				-0.013 - 0.4 * this.player,
				true,
				undefined,
			);
		} else {
			this.P2ScoreBarre = this.createRoundedPlane(
				0.2,
				0.19,
				0.025,
				0x212d45,
				-0.13,
				0.03 - 0.4 * this.player,
				true,
				undefined,
			);
		}
		this.P2ScoreBarre.position.set(
			this.P2ScoreBarre.position.x,
			this.P2ScoreBarre.position.y - 0.5,
			this.P2ScoreBarre.position.z,
		);
		if (flag === undefined)
			this.addTextToPlane(this.P2ScoreBarre, "0", 0, 0, 0xffffff);
		else
			this.addTextToPlane(
				this.P2ScoreBarre,
				flag[1].toString(),
				0,
				0,
				0xffffff,
			);
		let P1redFlag = false;
		let P2redFlag = false;
		if (whoscore === 1) P1redFlag = true;
		else P2redFlag = true;
		// ServeBarre
		this.P1red = this.createRoundedPlane(
			0.04,
			0.19,
			0.025,
			0xb30000,
			0,
			-(0.306 * this.player),
			P1redFlag,
			this.P1Score,
		);
		this.P2red = this.createRoundedPlane(
			0.04,
			0.19,
			0.025,
			0xb30000,
			0,
			-(0.326 * this.player),
			P2redFlag,
			this.P2Score,
		);
	}

	addTextToPlane(plane, text, x, y, color) {
		const loader = new FontLoader();
		loader.load(
			`https://${window.location.hostname}:3000/src/games/pong/Font.json`,
			(font) => {
				const textGeometry = new TextGeometry(text, {
					font: font,
					size: 0.07,
					depth: 0.01,
				});
				const textMaterial = new THREE.MeshBasicMaterial({ color: color });
				const textMesh = new THREE.Mesh(textGeometry, textMaterial);

				textMesh.position.set(x, y, 0.03); // Adjust position as needed
				plane.add(textMesh); // Add text to the plane as a child
			},
		);
	}

	TimeRender(flag) {
		this.timerDiv = this.createRoundedPlane(
			0.4,
			0.19,
			0.05,
			0x212d45,
			0.4,
			0,
			false,
			undefined,
		);
		this.timerDiv.position.set(
			this.timerDiv.position.x,
			this.timerDiv.position.y - 0.5,
			this.timerDiv.position.z,
		);
		if (flag === true)
			this.updateTextOnPlane(this.timerDiv, "00:00", -0.095, 0, 0.05, 0xffffff);
	}

	render() {
		// Optional: Adding a point light for more localized highlights or for lighting specific areas (like the center of the room)
		this.pointLight = new THREE.PointLight(0xffffff, 100000, 500); // Low intensity, limited range
		this.pointLight.position.set(0, -150, 0); // Placing in the center of the room
		this.wall1 = this.createWall(100, 0, 0, 200, 110, true, this.pointLight);
		this.wall2 = this.createWall(-100, 0, 0, 200, 110, true, this.pointLight);
		this.wall3 = this.createWall(0, 0, 100, 200, 110, false, this.pointLight);
		this.wall4 = this.createWall(0, 0, -100, 200, 110, false, this.pointLight);
		this.wall5 = this.createWall_(0, 55, 0, 200, 200, this.pointLight);
		this.wall6 = this.createWall_(0, -55, 0, 200, 200, this.pointLight);
		this.scene.add(this.pointLight);

		//score
		this.scoreRender(undefined, 1);
		this.startTime = Date.now();
		this.lastTime = Date.now();
		this.TimeRender(true);
	}

	ScalePlan() {
		this.scene.remove(this.timerDiv);
		this.scene.remove(this.P1Score);
		this.scene.remove(this.P2Score);
		this.scene.remove(this.P1ScoreBarre);
		this.scene.remove(this.P2ScoreBarre);
		this.scene.remove(this.P1red);
		this.scene.remove(this.P2red);
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

	addMatchPoint(Score) {
		if (Score[0] === 6) {
			this.RemoveMaterial(this.P1MatchPoint);
			this.P1MatchPoint = this.createRoundedPlane(
				0.6,
				0.19,
				0.05,
				0x212d45,
				0.13,
				-(0.82 * this.player),
				false,
				undefined,
			);
			this.P1MatchPoint.position.set(
				this.P1MatchPoint.position.x,
				this.P1MatchPoint.position.y - 0.5,
				this.P1MatchPoint.position.z,
			);
			this.addTextToPlane(this.P1MatchPoint, "Match Point", -0.25, 0, 0xffffff);
		}
		if (Score[1] === 6) {
			this.RemoveMaterial(this.P2MatchPoint);
			this.P2MatchPoint = this.createRoundedPlane(
				0.6,
				0.19,
				0.05,
				0x212d45,
				-0.13,
				-(0.82 * this.player),
				false,
				undefined,
			);
			this.P2MatchPoint.position.set(
				this.P2MatchPoint.position.x,
				this.P2MatchPoint.position.y - 0.5,
				this.P2MatchPoint.position.z,
			);
			this.addTextToPlane(this.P2MatchPoint, "Match Point", -0.25, 0, 0xffffff);
		}
	}

	cleanup() {
		this.RemoveMaterial(this.ambientLight);
		this.RemoveMaterial(this.directionalLight);
		this.RemoveMaterial(this.directionalLight1);
		this.RemoveMaterial(this.P1Score);
		this.RemoveMaterial(this.P2Score);
		this.RemoveMaterial(this.P1ScoreBarre);
		this.RemoveMaterial(this.P2ScoreBarre);
		this.RemoveMaterial(this.P1red);
		this.RemoveMaterial(this.P2red);
		this.RemoveMaterial(this.P1MatchPoint);
		this.RemoveMaterial(this.P2MatchPoint);
		this.RemoveMaterial(this.wall1);
		this.RemoveMaterial(this.wall2);
		this.RemoveMaterial(this.wall3);
		this.RemoveMaterial(this.wall4);
		this.RemoveMaterial(this.wall5);
		this.RemoveMaterial(this.wall6);
		this.RemoveMaterial(this.pointLight);
		this.RemoveMaterial(this.timerDiv);
	}
}

export default SceneManager;
