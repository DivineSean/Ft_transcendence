import * as THREE from "three";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

const G = 0.0009;

class Ball {
  constructor(scene, loader, player) {
    this.scene = scene;
    this.loader = loader;
    this.boundingSphere = undefined;
    this.bounceSound = undefined;
    this.netHitSound = undefined;
    this.paddleHitSound = undefined;
    this.onlyHit = undefined;
    this.swing = undefined;
    this.scoreSound = undefined;
    this.lostSound = undefined;
    this.BackgroundMusic = undefined;
    this.ballMatchPoint = undefined;
    this.GameOver = undefined;
    this.Defeat = undefined;
    this.Victory = undefined;
    this.Achievement = undefined;
    this.DorV = 0;
    this.player = player;
    this.radius = 0;
    this.scoreboard = [0, 0];
    this.whoscore = 1;
    this.isServerDemon = true;
    this.serverWin = 0;

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
    this.startTime = Date.now();
    this.timeout = false;

    //cleanup
    this.labelRenderer = undefined;
    this.container = undefined;
    this.div = undefined;
    this.label = undefined;
    this.model = undefined;
  }

  serve(net, sign) {
    this.scene.remove(this.label);
    if (
      (this.player === 1 && sign === 1) ||
      (this.player === 2 && sign === -1)
    ) {
      if (!this.scoreSound.isPlaying) {
        this.scoreSound.currentTime = 0;
        this.scoreSound.play();
      }
      this.scene.add(this.label);
      this.div.textContent = "10 Seconds To Serve the Ball\n\t0s\t";
    } else {
      if (!this.lostSound.isPlaying) {
        this.lostSound.currentTime = 0;
        this.lostSound.play();
      }
    }
    this.x = 42 * sign;
    this.y = net.boundingBox.max.y;
    this.z = -20 * sign;

    this.dx = 0;
    this.dy = 0;
    this.dz = 0;
    this.isServerDemon = true;
    this.count = 0;
    this.serving = true;
    this.timeout = false;
    this.lastshooter = sign;
    this.sendLock = false;
    this.startTime = Date.now();
  }

  CheckTimer(send) {
    const Timer = Math.floor((Date.now() - this.startTime) / 1000);
    this.div.textContent = `10 Seconds To Serve the Ball ${Timer}s`;

    if (Timer >= 10) {
      this.sendLost(send);
      this.sendLock = true;
      this.timeout = true;
    }
  }

  sendScore(send) {
    const data = { type: "score", message: {} };
    send(JSON.stringify(data));
  }

  sendLost(send) {
    this.count = 0;
    this.sendLock = true;
    this.serving = true;
    const data = {
      type: "update",
      message: {
        content: "lost",
        ball: {
          serving: this.serving,
          lstshoot: this.lastshooter,
        },
      },
    };
    send(JSON.stringify(data));
  }

  update(net, table, player1, send, dt, player, keyboard, globalMessage) {
    if (this.sendLock && this.serving && this.count >= 2) return;
    this.dy -= G;
    let flag = false;
    //serve
    if (this.serving) this.count = 0;
    if (this.y < -50 && this.sendLock === false && this.serving === false) {
      if (this.lastshooter === 1 && player === 1) {
        this.sendLost(send);
        this.sendLock = true;
        this.serving = true;
        return;
      } else if (this.lastshooter === -1 && player === 2) {
        this.sendLost(send);
        this.sendLock = true;
        this.serving = true;
        return;
      }
      this.sendLock = true;
      this.serving = true;
      if (this.isServerDemon) {
        this.serverWin++;
        if (this.serverWin === 3) {
          if (!this.Achievement.isPlaying) {
            this.Achievement.currentTime = 0;
            this.Achievement.play();
          }
          globalMessage({
            message: "Nobody Can handle that kind of power!",
            title: "The Server Demon Achieved",
          });
          this.serverWin = 0;
        }
      }
      return;
    } else if (this.boundingSphere.intersectsBox(table.boundingBoxTable)) {
      this.y = table.boundingBoxTable.max.y + 1;
      this.dy *= -0.6;
      if (!this.bounceSound.isPlaying) {
        this.bounceSound.currentTime = 0;
        this.bounceSound.play();
      }
      if (this.sendLock === false && this.serving === false && this.count < 2) {
        this.count++;
        if (this.x < 0) this.lastshooter = -1;
        else this.lastshooter = 1;
        if (this.count === 2) {
          if (this.lastshooter === -1 && player === 2) {
            this.sendLost(send);
          } else if (this.lastshooter === 1 && player === 1) {
            this.sendLost(send);
          }
          return;
        }
      }
    }
    let status = "";
    if (this.boundingSphere.intersectsBox(net.boundingBox)) {
      if (!this.netHitSound.isPlaying) {
        this.netHitSound.currentTime = 0.5;
        this.netHitSound.play();
      }
      player1.netshoot(this, net);
      this.count = 0;
      flag = true;
    }

    //Paddles
    if (
      this.boundingSphere.intersectsBox(player1.boundingBox) &&
      player1.rotating &&
      this.sendLock === false
    ) {
      if (!this.paddleHitSound.isPlaying) {
        this.paddleHitSound.currentTime = 0;
        this.paddleHitSound.play();
      }
      player1.shoot(net, keyboard, this, dt);
      status = "shoot";
      this.scene.remove(this.label);
      this.serving = false;
      this.lastshooter = player1.player;
      this.count = 0;
      flag = true;
    } else if (
      this.boundingSphere.intersectsBox(player1.boundingBox) &&
      !player1.rotating &&
      !this.serving
    ) {
      if (!this.onlyHit.isPlaying) {
        this.onlyHit.currentTime = 0;
        this.onlyHit.play();
      }
      status = "hit";
      player1.hit(this);
      this.scene.remove(this.label);
      this.serving = false;
      this.count = 0;
      this.lastshooter = player1.player;
      flag = true;
    } else if (player1.rotating && !this.swing.isPlaying) {
      this.swing.currentTime = 0;
      this.swing.play();
    }

    // Movement
    this.x += this.dx * dt;
    this.y += this.dy * dt;
    this.z += this.dz * dt;

    if (flag) {
      const data = {
        type: "update",
        message: {
          content: "ball",
          ball: {
            x: this.x,
            y: this.y,
            z: this.z,
            dx: this.dx,
            dy: this.dy,
            dz: this.dz,
            dt: dt,
            serving: this.serving,
            lstshoot: this.lastshooter,
            stats: status,
          },
        },
      };
      send(JSON.stringify(data));
    }

    this.model.position.set(this.x, this.y, this.z);
    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    this.radius = box.getSize(new THREE.Vector3()).length() / 2;
    this.boundingSphere = new THREE.Sphere(center, this.radius - 0.5);
  }

  updatePos() {
    this.model.position.set(this.x, this.y, this.z);
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

  async render(sm) {
    // Set up CSS2DRenderer
    this.container = document.getElementById("message");
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    this.container.appendChild(this.labelRenderer.domElement);
    this.div = document.createElement("div");
    this.div.className = "label";
    this.div.textContent = "10 Seconds To Serve the Ball\n\t0s\t";
    this.label = new CSS2DObject(this.div);
    this.label.position.set(0, 0, 0);
    this.scene.add(this.label);

    this.model = await this.loader
      .loadAsync(
        `https://${window.location.hostname}:3000/src/games/pong/ball.glb`,
      )
      .then((data) => data.scene.children[0]);

    this.model.position.set(this.x, this.y, this.z);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Load all sounds
    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/bounce.mp3`,
      (buffer) => {
        this.bounceSound = new THREE.Audio(sm.listener);
        this.bounceSound.setBuffer(buffer);
        this.bounceSound.setVolume(0.8);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/NetHit.mp3`,
      (buffer) => {
        this.netHitSound = new THREE.Audio(sm.listener);
        this.netHitSound.setBuffer(buffer);
        this.netHitSound.setVolume(0.8);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/hit.mp3`,
      (buffer) => {
        this.paddleHitSound = new THREE.Audio(sm.listener);
        this.paddleHitSound.setBuffer(buffer);
        this.paddleHitSound.setVolume(0.8);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/BallHit.mp3`,
      (buffer) => {
        this.onlyHit = new THREE.Audio(sm.listener);
        this.onlyHit.setBuffer(buffer);
        this.onlyHit.setVolume(0.8);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/swing.mp3`,
      (buffer) => {
        this.swing = new THREE.Audio(sm.listener);
        this.swing.setBuffer(buffer);
        this.swing.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/Music4.mp3`,
      (buffer) => {
        this.BackgroundMusic = new THREE.Audio(sm.listener);
        this.BackgroundMusic.setLoop(true);
        this.BackgroundMusic.setBuffer(buffer);
        this.BackgroundMusic.setVolume(0.05);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/scoring.mp3`,
      (buffer) => {
        this.scoreSound = new THREE.Audio(sm.listener);
        this.scoreSound.setBuffer(buffer);
        this.scoreSound.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/aww.mp3`,
      (buffer) => {
        this.lostSound = new THREE.Audio(sm.listener);
        this.lostSound.setBuffer(buffer);
        this.lostSound.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/MatchPoint.mp3`,
      (buffer) => {
        this.ballMatchPoint = new THREE.Audio(sm.listener);
        this.ballMatchPoint.setBuffer(buffer);
        this.ballMatchPoint.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/Defeat.mp3`,
      (buffer) => {
        this.Defeat = new THREE.Audio(sm.listener);
        this.Defeat.setBuffer(buffer);
        this.Defeat.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/Victory.mp3`,
      (buffer) => {
        this.Victory = new THREE.Audio(sm.listener);
        this.Victory.setBuffer(buffer);
        this.Victory.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/src/games/pong/Sounds/AchievementSong.mp3`,
      (buffer) => {
        this.Achievement = new THREE.Audio(sm.listener);
        this.Achievement.setBuffer(buffer);
        this.Achievement.setVolume(1);
      },
    );
    this.scene.add(this.model);

    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    this.radius = box.getSize(new THREE.Vector3()).length() / 2;
    this.boundingSphere = new THREE.Sphere(center, this.radius);
  }

  removeAudio(sound) {
    if (sound && sound.isPlaying) {
      sound.stop();
    }
    if (sound && sound.buffer) {
      sound.buffer = null;
    }
    if (sound) {
      sound = null;
    }
  }

  cleanup() {
    this.container.removeChild(this.labelRenderer.domElement);
    this.div.remove();
    this.RemoveMaterial(this.model);
    this.RemoveMaterial(this.label);
    this.scene.remove(this.labelRenderer);
    this.removeAudio(this.bounceSound);
    this.removeAudio(this.netHitSound);
    this.removeAudio(this.paddleHitSound);
    this.removeAudio(this.onlyHit);
    this.removeAudio(this.BackgroundMusic);
    this.removeAudio(this.scoreSound);
    this.removeAudio(this.lostSound);
    this.removeAudio(this.swing);
    this.removeAudio(this.ballMatchPoint);
    this.removeAudio(this.Defeat);
    this.removeAudio(this.Victory);
    this.removeAudio(this.Achievement);
  }
}

export default Ball;
