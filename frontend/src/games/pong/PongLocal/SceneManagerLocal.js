import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

export class SceneManager {
  constructor(globalMessage, setIsOver) {
    this.player = 1;
    this.globalMessage = globalMessage;
    this.setIsOver = setIsOver;
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / 2 / window.innerHeight,
      1,
      1000,
    );
    this.camera.aspect = window.innerWidth / 2 / window.innerHeight;
    this.camera.position.set(90, 20, 0);
    this.camera.lookAt(0, -28.5, 0);

    // Camera 2
    this.camera2 = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / 2 / window.innerHeight,
      1,
      1000,
    );
    this.camera2.aspect = window.innerWidth / 2 / window.innerHeight;
    this.camera2.position.set(-90, 20, 0);
    this.camera2.lookAt(0, -28.5, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#pong"),
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
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

    const controls1 = new OrbitControls(this.camera2, this.renderer.domElement);
    controls1.enableDamping = true;
    controls1.dampingFactor = 0.25;
    controls1.screenSpacePanning = false;
    controls1.enableRotate = false;
    controls1.enableZoom = false;
    controls1.enablePan = false;
    controls1.enabled = false;
    controls1.update();

    // Scene
    this.scene = new THREE.Scene();

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.FixLight(this.directionalLight, -80, 20, -45);

    this.directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    this.FixLight(this.directionalLight1, 80, 20, 45);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);

    this.P1ScoreS1 = undefined;
    this.P2ScoreS1 = undefined;
    this.P1ScoreBarreS1 = undefined;
    this.P2ScoreBarreS1 = undefined;
    this.P1redS1 = undefined;
    this.P2redS1 = undefined;
    this.P1MatchPointS1 = null;
    this.P2MatchPointS1 = null;
    this.pointLight = undefined;
    this.P1ScoreS2 = undefined;
    this.P2ScoreS2 = undefined;
    this.P1ScoreBarreS2 = undefined;
    this.P2ScoreBarreS2 = undefined;
    this.P1redS2 = undefined;
    this.P2redS2 = undefined;
    this.P1MatchPointS2 = null;
    this.P2MatchPointS2 = null;

    this.wall1 = undefined;
    this.wall2 = undefined;
    this.wall3 = undefined;
    this.wall4 = undefined;
    this.wall5 = undefined;
    this.wall6 = undefined;

    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    this.audioLoader = new THREE.AudioLoader();
  }

  FixLight(light, x, y, z) {
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

  TimerCSS() {
    this.lastTime = Date.now();
    const elapsedTimeInSeconds = Math.floor(
      (this.lastTime - this.startTime) / 1000,
    );
    const minutes = Math.floor(elapsedTimeInSeconds / 60);
    const seconds = elapsedTimeInSeconds % 60;
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    this.updateTextOnPlane(
      this.timerDivS1,
      `${formattedTime}`,
      -0.095,
      0,
      0.05,
      0xffffff,
    );
    this.updateTextOnPlane(
      this.timerDivS2,
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
    return wall;
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
    return wall;
  }

  updateTextOnPlane(plane, text, x, y, z, color) {
    const loader = new FontLoader();
    loader.load(
      `https://${window.location.hostname}:${window.location.port}/games/Fonts/Font.json`,
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

  scoreUpdate(P, whoScore, ball, net) {
    this.scene.remove(this.P1redS1);
    this.scene.remove(this.P1redS2);
    this.scene.remove(this.P2redS1);
    this.scene.remove(this.P2redS2);
    ball.whoscore = whoScore;
    if (whoScore === 1) {
      this.scene.add(this.P1redS1);
      this.scene.add(this.P1redS2);
      P[0]++;
      ball.serve(net, 1);
    } else if (whoScore === 2) {
      this.scene.add(this.P2redS1);
      this.scene.add(this.P2redS2);
      P[1]++;
      ball.serve(net, -1);
    }
    if (P[0] === 6) {
      this.RemovePlaneText(this.P1MatchPointS1);
      this.RemovePlaneText(this.P1MatchPointS2);
      this.P1MatchPointS1 = this.createRoundedPlane(
        1,
        this.camera,
        0.6,
        0.19,
        0.05,
        0x212d45,
        0.13,
        -0.82,
        false,
        undefined,
      );
      this.P1MatchPointS2 = this.createRoundedPlane(
        -1,
        this.camera2,
        0.6,
        0.19,
        0.05,
        0x212d45,
        0.13,
        -(0.82 * -1),
        false,
        undefined,
      );
      this.P1MatchPointS1.position.set(
        this.P1MatchPointS1.position.x,
        this.P1MatchPointS1.position.y - 0.5,
        this.P1MatchPointS1.position.z,
      );
      this.P1MatchPointS2.position.set(
        this.P1MatchPointS2.position.x,
        this.P1MatchPointS2.position.y - 0.5,
        this.P1MatchPointS2.position.z,
      );
      this.addTextToPlane(
        this.P1MatchPointS1,
        "Match Point",
        -0.25,
        0,
        0xffffff,
      );
      this.addTextToPlane(
        this.P1MatchPointS2,
        "Match Point",
        -0.25,
        0,
        0xffffff,
      );
    }
    if (P[1] === 6) {
      this.RemovePlaneText(this.P2MatchPointS1);
      this.RemovePlaneText(this.P2MatchPointS2);
      this.P2MatchPointS1 = this.createRoundedPlane(
        1,
        this.camera,
        0.6,
        0.19,
        0.05,
        0x212d45,
        -0.13,
        -0.82,
        false,
        undefined,
      );
      this.P2MatchPointS2 = this.createRoundedPlane(
        -1,
        this.camera2,
        0.6,
        0.19,
        0.05,
        0x212d45,
        -0.13,
        -(0.82 * -1),
        false,
        undefined,
      );
      this.P2MatchPointS1.position.set(
        this.P2MatchPointS1.position.x,
        this.P2MatchPointS1.position.y - 0.5,
        this.P2MatchPointS1.position.z,
      );
      this.P2MatchPointS2.position.set(
        this.P2MatchPointS2.position.x,
        this.P2MatchPointS2.position.y - 0.5,
        this.P2MatchPointS2.position.z,
      );
      this.addTextToPlane(
        this.P2MatchPointS1,
        "Match Point",
        -0.25,
        0,
        0xffffff,
      );
      this.addTextToPlane(
        this.P2MatchPointS2,
        "Match Point",
        -0.25,
        0,
        0xffffff,
      );
    }
    if (P[0] === 6 || P[1] === 6) {
      ball.BackgroundMusic.setVolume(0.03);
      if (!ball.ballMatchPoint.isPlaying) {
        ball.ballMatchPoint.currentTime = 0;
        ball.ballMatchPoint.play();
      }
    }
    this.updateTextOnPlane(
      this.P1ScoreBarreS1,
      P[0].toString(),
      0,
      0,
      0.03,
      0xffffff,
    );
    this.updateTextOnPlane(
      this.P2ScoreBarreS1,
      P[1].toString(),
      0,
      0,
      0.03,
      0xffffff,
    );
    this.updateTextOnPlane(
      this.P1ScoreBarreS2,
      P[0].toString(),
      0,
      0,
      0.03,
      0xffffff,
    );
    this.updateTextOnPlane(
      this.P2ScoreBarreS2,
      P[1].toString(),
      0,
      0,
      0.03,
      0xffffff,
    );
    if (P[0] === 7 || P[1] === 7) {
      ball.bounceSound.setVolume(0);
      ball.netHitSound.setVolume(0);
      ball.paddleHitSound.setVolume(0);
      ball.onlyHit.setVolume(0);
      ball.swing.setVolume(0);
      ball.scoreSound.setVolume(0);
      ball.BackgroundMusic.setVolume(0);
      ball.lostSound.setVolume(0);
      ball.ballMatchPoint.setVolume(0);
      if (P[0] === 7 || P[1] === 7) {
        ball.Victory.currentTime = 0;
        ball.Victory.play();
      }
      this.setIsOver(true);
    }
  }

  createRoundedPlane(
    player,
    camera,
    width,
    height,
    radius,
    clor,
    y,
    z,
    flag,
    PlayerScore,
  ) {
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
      camera.getWorldDirection(cameraDirection);
      const distance = 1; // Distance from the camera to the target plane
      const vFOV = THREE.MathUtils.degToRad(camera.fov); // Convert vertical FOV to radians
      const cameraHeight = 2 * Math.tan(vFOV / 2) * distance;
      const cameraWidth = cameraHeight * camera.aspect;
      c = new THREE.Vector3(
        camera.position.x + cameraHeight * player + 0.5 * player,
        camera.position.y - cameraHeight + y,
        camera.position.z + cameraWidth * player + z,
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
    Score.quaternion.copy(camera.quaternion);
    if (PlayerScore && !flag) return Score;
    this.scene.add(Score);
    return Score;
  }

  RemoveText(plane) {
    if (!plane) return;
    for (let i = plane.children.length - 1; i >= 0; i--) {
      const child = plane.children[i];
      plane.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
  }

  scoreRender(flag, whoscore) {
    // NameBar
    this.P1ScoreS1 = this.createRoundedPlane(
      1,
      this.camera,
      1,
      0.19,
      0.025,
      0xa9eafe,
      0.13,
      0,
      false,
      undefined,
    );
    this.P1ScoreS1.position.set(
      this.P1ScoreS1.position.x,
      this.P1ScoreS1.position.y - 0.5,
      this.P1ScoreS1.position.z,
    );
    this.addTextToPlane(this.P1ScoreS1, "Player 1", -0.4, 0, 0x000000);

    this.P1ScoreS2 = this.createRoundedPlane(
      -1,
      this.camera2,
      1,
      0.19,
      0.025,
      0xa9eafe,
      0.13,
      0,
      false,
      undefined,
    );
    this.P1ScoreS2.position.set(
      this.P1ScoreS2.position.x,
      this.P1ScoreS2.position.y - 0.5,
      this.P1ScoreS2.position.z,
    );
    this.addTextToPlane(this.P1ScoreS2, "Player 1", -0.4, 0, 0x000000);

    this.P2ScoreS1 = this.createRoundedPlane(
      1,
      this.camera,
      1,
      0.19,
      0.025,
      0xa9eafe,
      -0.13,
      0.045,
      false,
      undefined,
    );
    this.P2ScoreS1.position.set(
      this.P2ScoreS1.position.x,
      this.P2ScoreS1.position.y - 0.5,
      this.P2ScoreS1.position.z,
    );
    this.addTextToPlane(this.P2ScoreS1, "Player 2", -0.4, 0, 0x000000);

    this.P2ScoreS2 = this.createRoundedPlane(
      -1,
      this.camera2,
      1,
      0.19,
      0.025,
      0xa9eafe,
      -0.13,
      -0.035,
      false,
      undefined,
    );
    this.P2ScoreS2.position.set(
      this.P2ScoreS2.position.x,
      this.P2ScoreS2.position.y - 0.5,
      this.P2ScoreS2.position.z,
    );
    this.addTextToPlane(this.P2ScoreS2, "Player 2", -0.4, 0, 0x000000);

    // ScoreBarre
    this.P1ScoreBarreS1 = this.createRoundedPlane(
      1,
      this.camera,
      0.2,
      0.19,
      0.025,
      0x212d45,
      0.13,
      -0.4,
      true,
      undefined,
    );
    this.P1ScoreBarreS1.position.set(
      this.P1ScoreBarreS1.position.x,
      this.P1ScoreBarreS1.position.y - 0.5,
      this.P1ScoreBarreS1.position.z,
    );
    if (flag === undefined)
      this.addTextToPlane(this.P1ScoreBarreS1, "0", 0, 0, 0xffffff);
    else
      this.addTextToPlane(
        this.P1ScoreBarreS1,
        flag[0].toString(),
        0,
        0,
        0xffffff,
      );

    this.P1ScoreBarreS2 = this.createRoundedPlane(
      -1,
      this.camera2,
      0.2,
      0.19,
      0.025,
      0x212d45,
      0.13,
      -0.4 * -1,
      true,
      undefined,
    );
    this.P1ScoreBarreS2.position.set(
      this.P1ScoreBarreS2.position.x,
      this.P1ScoreBarreS2.position.y - 0.5,
      this.P1ScoreBarreS2.position.z,
    );
    if (flag === undefined)
      this.addTextToPlane(this.P1ScoreBarreS2, "0", 0, 0, 0xffffff);
    else
      this.addTextToPlane(
        this.P1ScoreBarreS2,
        flag[0].toString(),
        0,
        0,
        0xffffff,
      );

    this.P2ScoreBarreS1 = this.createRoundedPlane(
      1,
      this.camera,
      0.2,
      0.19,
      0.025,
      0x212d45,
      -0.13,
      0.03 - 0.4,
      true,
      undefined,
    );
    this.P2ScoreBarreS1.position.set(
      this.P2ScoreBarreS1.position.x,
      this.P2ScoreBarreS1.position.y - 0.5,
      this.P2ScoreBarreS1.position.z,
    );
    if (flag === undefined)
      this.addTextToPlane(this.P2ScoreBarreS1, "0", 0, 0, 0xffffff);
    else
      this.addTextToPlane(
        this.P2ScoreBarreS1,
        flag[1].toString(),
        0,
        0,
        0xffffff,
      );

    this.P2ScoreBarreS2 = this.createRoundedPlane(
      -1,
      this.camera2,
      0.2,
      0.19,
      0.025,
      0x212d45,
      -0.13,
      -0.013 - 0.4 * -1,
      true,
      undefined,
    );
    this.P2ScoreBarreS2.position.set(
      this.P2ScoreBarreS2.position.x,
      this.P2ScoreBarreS2.position.y - 0.5,
      this.P2ScoreBarreS2.position.z,
    );
    if (flag === undefined)
      this.addTextToPlane(this.P2ScoreBarreS2, "0", 0, 0, 0xffffff);
    else
      this.addTextToPlane(
        this.P2ScoreBarreS2,
        flag[1].toString(),
        0,
        0,
        0xffffff,
      );

    // ServeBarre
    let P1redFlag = false;
    let P2redFlag = false;
    if (whoscore === 1) P1redFlag = true;
    else P2redFlag = true;
    this.P1redS1 = this.createRoundedPlane(
      1,
      this.camera,
      0.04,
      0.19,
      0.025,
      0xb30000,
      0,
      -0.306,
      P1redFlag,
      this.P1ScoreS1,
    );
    this.P1redS2 = this.createRoundedPlane(
      -1,
      this.camera2,
      0.04,
      0.19,
      0.025,
      0xb30000,
      0,
      -0.306 * -1,
      P1redFlag,
      this.P1ScoreS2,
    );
    this.P2redS1 = this.createRoundedPlane(
      1,
      this.camera,
      0.04,
      0.19,
      0.025,
      0xb30000,
      0,
      -0.326,
      P2redFlag,
      this.P2ScoreS1,
    );
    this.P2redS2 = this.createRoundedPlane(
      -1,
      this.camera2,
      0.04,
      0.19,
      0.025,
      0xb30000,
      0,
      -0.326 * -1,
      P2redFlag,
      this.P2ScoreS2,
    );
  }

  addTextToPlane(plane, text, x, y, color) {
    const loader = new FontLoader();
    loader.load(
      `https://${window.location.hostname}:${window.location.port}/games/Fonts/Font.json`,
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

  r() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setScissorTest(true);
    this.renderer.clear(true, true, true);
    this.renderer.setViewport(0, 0, (width - 5) / 2, height);
    this.renderer.setScissor(0, 0, (width - 5) / 2, height);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setViewport((width + 5) / 2, 0, width / 2, height);
    this.renderer.setScissor((width + 5) / 2, 0, width / 2, height);
    this.renderer.render(this.scene, this.camera2);
    this.renderer.setScissorTest(false);
  }

  TimeRender(flag) {
    this.timerDivS1 = this.createRoundedPlane(
      1,
      this.camera,
      0.4,
      0.19,
      0.05,
      0x212d45,
      0.4,
      0,
      false,
      undefined,
    );
    this.timerDivS1.position.set(
      this.timerDivS1.position.x,
      this.timerDivS1.position.y - 0.5,
      this.timerDivS1.position.z,
    );
    if (flag === true)
      this.updateTextOnPlane(
        this.timerDivS1,
        "00:00",
        -0.095,
        0,
        0.05,
        0xffffff,
      );
    this.timerDivS2 = this.createRoundedPlane(
      -1,
      this.camera2,
      0.4,
      0.19,
      0.05,
      0x212d45,
      0.4,
      0,
      false,
      undefined,
    );
    this.timerDivS2.position.set(
      this.timerDivS2.position.x,
      this.timerDivS2.position.y - 0.5,
      this.timerDivS2.position.z,
    );
    if (flag === true)
      this.updateTextOnPlane(
        this.timerDivS2,
        "00:00",
        -0.095,
        0,
        0.05,
        0xffffff,
      );
  }

  RemovePlaneText(plane) {
    if (plane) {
      this.RemoveText(plane);
      this.scene.remove(plane);
      if (plane.geometry) plane.geometry.dispose();
      if (plane.material) plane.material.dispose();
      plane = null;
    }
  }

  addMatchPoint(Score) {
    if (Score[0] === 6) {
      this.RemovePlaneText(this.P1MatchPointS1);
      this.RemovePlaneText(this.P1MatchPointS2);
      this.P1MatchPointS1 = this.createRoundedPlane(
        1,
        this.camera,
        0.6,
        0.19,
        0.05,
        0x212d45,
        0.13,
        -0.82,
        false,
        undefined,
      );
      this.P1MatchPointS2 = this.createRoundedPlane(
        -1,
        this.camera2,
        0.6,
        0.19,
        0.05,
        0x212d45,
        0.13,
        -(0.82 * -1),
        false,
        undefined,
      );
      this.P1MatchPointS1.position.set(
        this.P1MatchPointS1.position.x,
        this.P1MatchPointS1.position.y - 0.5,
        this.P1MatchPointS1.position.z,
      );
      this.P1MatchPointS2.position.set(
        this.P1MatchPointS2.position.x,
        this.P1MatchPointS2.position.y - 0.5,
        this.P1MatchPointS2.position.z,
      );
      this.addTextToPlane(
        this.P1MatchPointS1,
        "Match Point",
        -0.25,
        0,
        0xffffff,
      );
      this.addTextToPlane(
        this.P1MatchPointS2,
        "Match Point",
        -0.25,
        0,
        0xffffff,
      );
    }
    if (Score[1] === 6) {
      this.RemovePlaneText(this.P2MatchPointS1);
      this.RemovePlaneText(this.P2MatchPointS2);
      this.P2MatchPointS1 = this.createRoundedPlane(
        1,
        this.camera,
        0.6,
        0.19,
        0.05,
        0x212d45,
        -0.13,
        -0.82,
        false,
        undefined,
      );
      this.P2MatchPointS2 = this.createRoundedPlane(
        -1,
        this.camera2,
        0.6,
        0.19,
        0.05,
        0x212d45,
        -0.13,
        -(0.82 * -1),
        false,
        undefined,
      );
      this.P2MatchPointS1.position.set(
        this.P2MatchPointS1.position.x,
        this.P2MatchPointS1.position.y - 0.5,
        this.P2MatchPointS1.position.z,
      );
      this.P2MatchPointS2.position.set(
        this.P2MatchPointS2.position.x,
        this.P2MatchPointS2.position.y - 0.5,
        this.P2MatchPointS2.position.z,
      );
      this.addTextToPlane(
        this.P2MatchPointS1,
        "Match Point",
        -0.25,
        0,
        0xffffff,
      );
      this.addTextToPlane(
        this.P2MatchPointS2,
        "Match Point",
        -0.25,
        0,
        0xffffff,
      );
    }
  }

  render() {
    this.pointLight = new THREE.PointLight(0xffffff, 100000, 500);
    this.pointLight.position.set(0, -150, 0);
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
    this.scene.remove(this.timerDivS1);
    this.scene.remove(this.timerDivS2);
    this.scene.remove(this.P1ScoreS1);
    this.scene.remove(this.P2ScoreS1);
    this.scene.remove(this.P1ScoreBarreS1);
    this.scene.remove(this.P2ScoreBarreS1);
    this.scene.remove(this.P1redS1);
    this.scene.remove(this.P2redS1);

    this.scene.remove(this.P1ScoreS2);
    this.scene.remove(this.P2ScoreS2);
    this.scene.remove(this.P1ScoreBarreS2);
    this.scene.remove(this.P2ScoreBarreS2);
    this.scene.remove(this.P1redS2);
    this.scene.remove(this.P2redS2);
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

  cleanup() {
    this.RemoveMaterial(this.ambientLight);
    this.RemoveMaterial(this.directionalLight);
    this.RemoveMaterial(this.directionalLight1);
    this.RemoveMaterial(this.P1ScoreS1);
    this.RemoveMaterial(this.P1ScoreS2);
    this.RemoveMaterial(this.P2ScoreS1);
    this.RemoveMaterial(this.P2ScoreS2);
    this.RemoveMaterial(this.P1ScoreBarreS1);
    this.RemoveMaterial(this.P1ScoreBarreS2);
    this.RemoveMaterial(this.P2ScoreBarreS1);
    this.RemoveMaterial(this.P2ScoreBarreS2);
    this.RemoveMaterial(this.P1redS1);
    this.RemoveMaterial(this.P1redS2);
    this.RemoveMaterial(this.P2redS1);
    this.RemoveMaterial(this.P2redS2);
    this.RemoveMaterial(this.P1MatchPointS1);
    this.RemoveMaterial(this.P1MatchPointS2);
    this.RemoveMaterial(this.P2MatchPointS1);
    this.RemoveMaterial(this.P2MatchPointS2);
    this.RemoveMaterial(this.wall1);
    this.RemoveMaterial(this.wall2);
    this.RemoveMaterial(this.wall3);
    this.RemoveMaterial(this.wall4);
    this.RemoveMaterial(this.wall5);
    this.RemoveMaterial(this.wall6);
    this.RemoveMaterial(this.pointLight);
    this.RemoveMaterial(this.timerDivS1);
    this.RemoveMaterial(this.timerDivS2);
  }
}

export default SceneManager;
