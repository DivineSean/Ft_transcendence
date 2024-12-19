import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

export class SceneManager {
  constructor(player, names) {
    this.player = player;
    this.names = names;
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

    // Lighting (Directional Lights)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-80, 20, -45); // Position it above the room
    directionalLight.target.position.set(0, -25.5, 0); // P
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; // Shadow map width (increase for higher resolution)
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.radius = 0.5;
    directionalLight.shadow.blurSamples = 3;
    this.scene.add(directionalLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(80, 20, 45); // Position it above the room
    directionalLight1.target.position.set(0, -25.5, 0); // P
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048; // Shadow map width (increase for higher resolution)
    directionalLight1.shadow.mapSize.height = 2048;
    directionalLight1.shadow.camera.near = 0.5;
    directionalLight1.shadow.camera.far = 200;
    directionalLight1.shadow.camera.left = -200;
    directionalLight1.shadow.camera.right = 200;
    directionalLight1.shadow.camera.top = 200;
    directionalLight1.shadow.camera.bottom = -200;
    directionalLight1.shadow.radius = 0.5;
    directionalLight1.shadow.blurSamples = 3;
    this.scene.add(directionalLight1);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    this.P1Score = undefined;
    this.P2Score = undefined;
    this.P1ScoreBarre = undefined;
    this.P2ScoreBarre = undefined;
    this.P1red = undefined;
    this.P2red = undefined;
    this.P1MatchPoint = undefined;
    this.P2MatchPoint = undefined;

    this.audioLoader = new THREE.AudioLoader();
    this.listener = new THREE.AudioListener();
  }

  TimerCSS() {
    this.lastTime = Date.now();
    const elapsedTimeInSeconds = Math.floor(
      (this.lastTime - this.startTime) / 1000,
    );
    const minutes = Math.floor(elapsedTimeInSeconds / 60);
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
    if (rotate === true) wall.rotateY(Math.PI / 2); // Rotate to stand vertically
    wall.position.set(x, y, z); // Adjust position
    wall.receiveShadow = true;
    pointLight.target = wall;
    this.scene.add(wall);
  }

  createWall_(x, y, z, width, height, pointLight) {
    const wallGeometry = new THREE.PlaneGeometry(width, height);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x000039,
      side: THREE.DoubleSide,
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.rotateX(Math.PI / 2); // Rotate to stand vertically
    wall.position.set(x, y, z); // Adjust position
    wall.receiveShadow = true;
    pointLight.target = wall;
    this.scene.add(wall);
  }

  updateTextOnPlane(plane, text, x, y, z, color) {
    const loader = new FontLoader();

    loader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Font.json`,
      (font) => {
        // Remove the old text mesh (if any)
        plane.children.forEach((child) => {
          if (child.isMesh && child.geometry instanceof TextGeometry) {
            plane.remove(child);
            child.geometry.dispose(); // Clean up geometry
            child.material.dispose(); // Clean up material
          }
        });

        // Create new text geometry
        const textGeometry = new TextGeometry(text, {
          font: font,
          size: 0.07,
          depth: 0.01,
        });

        // Create new material
        const textMaterial = new THREE.MeshBasicMaterial({ color: color });

        // Create new text mesh
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Set position of the new text
        textMesh.position.set(x, y, z);

        // Add the new text mesh to the plane
        plane.add(textMesh);
      },
    );
  }

  scoreUpdate(P, whoScore, ball) {
    ball.scoreboard[0] = Number(P["1"]);
    ball.scoreboard[1] = Number(P["2"]);
    ball.whoscore = whoScore;
    this.scene.remove(this.P1red);
    this.scene.remove(this.P2red);
    if (whoScore === 1) this.scene.add(this.P1red);
    else if (whoScore === 2) this.scene.add(this.P2red);
    if (P["1"] === "6") {
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
      this.P1MatchPoint.position.set(this.P1MatchPoint.position.x, this.P1MatchPoint.position.y - 0.5, this.P1MatchPoint.position.z + (0.3 * this.player));
      this.addTextToPlane(this.P1MatchPoint, "Match Point", -0.25, 0, 0xffffff);
    }
    if (P["2"] === "6") {
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
      this.P2MatchPoint.position.set(this.P2MatchPoint.position.x, this.P2MatchPoint.position.y - 0.5, this.P2MatchPoint.position.z + (0.3 * this.player));
      this.addTextToPlane(this.P2MatchPoint, "Match Point", -0.25, 0, 0xffffff);
    }
    if (
      (this.player === -1 && P["1"] === "6") ||
      (this.player === 1 && P["2"] === "6")
    ) {
      if(!ball.BackgroundMusic.isPlaying)
      {
        ball.BackgroundMusic.setVolume(0.03);
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
          if(!ball.Victory.isPlaying)
          {
            ball.Victory.currentTime = 0;
            ball.Victory.play();
          }
        } else {
          if(!ball.Defeat.isPlaying)
          {
            ball.Defeat.currentTime = 0;
            ball.Defeat.play();
          }
        }
      } else {
        if (this.player === 1) {
          if(!ball.Defeat.isPlaying)
          {
            ball.Defeat.currentTime = 0;
            ball.Defeat.play();
          }
        } else {
          if(!ball.Victory.isPlaying)
          {
            ball.Victory.currentTime = 0;
            ball.Victory.play();
          }
        }
      }
      this.renderer.xr.getSession().end();
      return false;
    }
    return true;
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
    this.P1Score.position.set(this.P1Score.position.x, this.P1Score.position.y - 0.5, this.P1Score.position.z);
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
    this.P2Score.position.set(this.P2Score.position.x, this.P2Score.position.y - 0.5, this.P2Score.position.z);
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
    this.P1ScoreBarre.position.set(this.P1ScoreBarre.position.x, this.P1ScoreBarre.position.y - 0.5, this.P1ScoreBarre.position.z);
    if (flag === undefined)
      this.addTextToPlane(this.P1ScoreBarre, "0", 0, 0, 0xffffff);
    else
      this.addTextToPlane(this.P1ScoreBarre, flag[0].toString(), 0, 0, 0xffffff);

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
    this.P2ScoreBarre.position.set(this.P2ScoreBarre.position.x, this.P2ScoreBarre.position.y - 0.5, this.P2ScoreBarre.position.z);
    if(flag === undefined)
      this.addTextToPlane(this.P2ScoreBarre, "0", 0, 0, 0xffffff);
    else
      this.addTextToPlane(this.P2ScoreBarre, flag[1].toString(), 0, 0, 0xffffff);
    let P1redFlag = false;
    let P2redFlag = false;
    if (whoscore === 1)
      P1redFlag = true;
    else
      P2redFlag = true;
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

  TimeRender(flag)
  {
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
    this.timerDiv.position.set(this.timerDiv.position.x, this.timerDiv.position.y - 0.5, this.timerDiv.position.z);
    if (flag === true)
      this.updateTextOnPlane(this.timerDiv, "00:00", -0.095, 0, 0.05, 0xffffff);
  }

  render() {
    // Optional: Adding a point light for more localized highlights or for lighting specific areas (like the center of the room)
    const pointLight = new THREE.PointLight(0xffffff, 100000, 500); // Low intensity, limited range
    pointLight.position.set(0, -150, 0); // Placing in the center of the room
    this.createWall(100, 0, 0, 200, 110, true, pointLight);
    this.createWall(-100, 0, 0, 200, 110, true, pointLight);
    this.createWall(0, 0, 100, 200, 110, false, pointLight);
    this.createWall(0, 0, -100, 200, 110, false, pointLight);
    this.createWall_(0, 55, 0, 200, 200, pointLight);
    this.createWall_(0, -55, 0, 200, 200, pointLight);
    this.scene.add(pointLight);

    //score
    this.scoreRender(undefined, 1);
    this.startTime = Date.now();
    this.lastTime = Date.now();
    this.TimeRender(true);
  }

  ScalePlan()
  {
    this.scene.remove(this.timerDiv);
    this.scene.remove(this.P1Score);
    this.scene.remove(this.P2Score);
    this.scene.remove(this.P1ScoreBarre);
    this.scene.remove(this.P2ScoreBarre);
    this.scene.remove(this.P1red);
    this.scene.remove(this.P2red);
    this.scene.remove(this.P1MatchPoint);
    this.scene.remove(this.P2MatchPoint);
  }

  cleanUp() {}
}

export default SceneManager;
