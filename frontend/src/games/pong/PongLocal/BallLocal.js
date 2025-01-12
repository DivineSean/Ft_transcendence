import * as THREE from "three";

const G = 0.0009;

class Ball {
  constructor(scene, loader) {
    this.scene = scene;
    this.model = undefined;
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
    this.DorV = 0;
    this.radius = 0;
    this.scoreboard = [0, 0];
    this.whoscore = 1;

    this.x = 42;
    this.y = -23.5;
    this.z = -20;

    this.dx = 0;
    this.dy = 0;
    this.dz = 0;

    this.count = 0;
    this.serving = true;
    this.lastshooter = 1;
    this.startTime = Date.now();
  }

  serve(net, sign) {
    if (sign === 1 && !this.scoreSound.isPlaying) {
      this.scoreSound.currentTime = 0;
      this.scoreSound.play();
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
    this.count = 0;
    this.serving = true;
    this.lastshooter = sign;
    this.startTime = Date.now();
  }

  update(sm, net, table, player1, player2, dt, keyboard) {
    this.dy -= G;
    //serve
    if (this.y < -50) {
      if (this.lastshooter === 1) {
        sm.scoreUpdate(this.scoreboard, 2, this, net);
      } else if (this.lastshooter === -1) {
        sm.scoreUpdate(this.scoreboard, 1, this, net);
      }
      return;
    }
    if (this.boundingSphere.intersectsBox(table.boundingBoxTable)) {
      this.y = table.boundingBoxTable.max.y + 1;
      this.dy *= -0.6;
      if (!this.bounceSound.isPlaying) {
        this.bounceSound.currentTime = 0;
        this.bounceSound.play();
      }
      if (!this.serving) this.count++;
      if (this.x < 0) this.lastshooter = -1;
      else this.lastshooter = 1;
      if (this.count === 2) {
        if (this.lastshooter === -1) {
          sm.scoreUpdate(this.scoreboard, 1, this, net);
        } else if (this.lastshooter === 1) {
          sm.scoreUpdate(this.scoreboard, 2, this, net);
        }
        return;
      }
    }
    if (this.boundingSphere.intersectsBox(net.boundingBox)) {
      if (!this.netHitSound.isPlaying) {
        this.netHitSound.currentTime = 0.5;
        this.netHitSound.play();
      }
      player1.netshoot(this, net);
      this.count = 0;
    }

    //Paddles
    if (
      this.boundingSphere.intersectsBox(player1.boundingBox) &&
      player1.rotating
    ) {
      if (!this.paddleHitSound.isPlaying) {
        this.paddleHitSound.currentTime = 0;
        this.paddleHitSound.play();
      }
      this.serving = false;
      player1.shoot(net, keyboard, this, dt);
      this.lastshooter = player1.player;
      this.count = 0;
    } else if (
      this.boundingSphere.intersectsBox(player1.boundingBox) &&
      !player1.rotating &&
      !this.serving
    ) {
      if (!this.onlyHit.isPlaying) {
        this.onlyHit.currentTime = 0;
        this.onlyHit.play();
      }
      player1.hit(this);
      this.count = 0;
      this.lastshooter = player1.player;
    } else if (player1.rotating && !this.swing.isPlaying) {
      this.swing.currentTime = 0;
      this.swing.play();
    }

    //Paddles
    if (
      this.boundingSphere.intersectsBox(player2.boundingBox) &&
      player2.rotating
    ) {
      if (!this.paddleHitSound.isPlaying) {
        this.paddleHitSound.currentTime = 0;
        this.paddleHitSound.play();
      }
      this.serving = false;
      player2.shoot(net, keyboard, this);
      this.lastshooter = player2.player;
      this.count = 0;
    } else if (
      this.boundingSphere.intersectsBox(player2.boundingBox) &&
      !player2.rotating &&
      !this.serving
    ) {
      if (!this.onlyHit.isPlaying) {
        this.onlyHit.currentTime = 0;
        this.onlyHit.play();
      }
      player2.hit(this);
      this.count = 0;
      this.lastshooter = player2.player;
    } else if (player2.rotating && !this.swing.isPlaying) {
      this.swing.currentTime = 0;
      this.swing.play();
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

  removeAudio(sound) {
    if (!sound) return;
    sound.setLoop(false);
    if (sound.isPlaying) {
      sound.stop();
      sound.disconnect();
    }
    if (sound.buffer) {
      sound.setBuffer(null);
    }
    sound = null;
  }

  cleanup() {
    this.RemoveMaterial(this.model);
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

  async render(sm) {
    this.model = await this.loader
      .loadAsync(
        `https://${window.location.hostname}:3000/public/games/models/ball.glb`,
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
      `https://${window.location.hostname}:3000/public/games/Sounds/bounce.mp3`,
      (buffer) => {
        this.bounceSound = new THREE.Audio(sm.listener);
        this.bounceSound.setBuffer(buffer);
        this.bounceSound.setVolume(0.8);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/public/games/Sounds/NetHit.mp3`,
      (buffer) => {
        this.netHitSound = new THREE.Audio(sm.listener);
        this.netHitSound.setBuffer(buffer);
        this.netHitSound.setVolume(0.8);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/public/games/Sounds/hit.mp3`,
      (buffer) => {
        this.paddleHitSound = new THREE.Audio(sm.listener);
        this.paddleHitSound.setBuffer(buffer);
        this.paddleHitSound.setVolume(0.8);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/public/games/Sounds/BallHit.mp3`,
      (buffer) => {
        this.onlyHit = new THREE.Audio(sm.listener);
        this.onlyHit.setBuffer(buffer);
        this.onlyHit.setVolume(0.8);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/public/games/Sounds/swing.mp3`,
      (buffer) => {
        this.swing = new THREE.Audio(sm.listener);
        this.swing.setBuffer(buffer);
        this.swing.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/public/games/Sounds/Music4.mp3`,
      (buffer) => {
        this.BackgroundMusic = new THREE.Audio(sm.listener);
        this.BackgroundMusic.setLoop(true);
        this.BackgroundMusic.setBuffer(buffer);
        this.BackgroundMusic.setVolume(0.1);
        this.BackgroundMusic.play();
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/public/games/Sounds/scoring.mp3`,
      (buffer) => {
        this.scoreSound = new THREE.Audio(sm.listener);
        this.scoreSound.setBuffer(buffer);
        this.scoreSound.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/public/games/Sounds/aww.mp3`,
      (buffer) => {
        this.lostSound = new THREE.Audio(sm.listener);
        this.lostSound.setBuffer(buffer);
        this.lostSound.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/public/games/Sounds/MatchPoint.mp3`,
      (buffer) => {
        this.ballMatchPoint = new THREE.Audio(sm.listener);
        this.ballMatchPoint.setBuffer(buffer);
        this.ballMatchPoint.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/public/games/Sounds/Defeat.mp3`,
      (buffer) => {
        this.Defeat = new THREE.Audio(sm.listener);
        this.Defeat.setBuffer(buffer);
        this.Defeat.setVolume(0.5);
      },
    );

    sm.audioLoader.load(
      `https://${window.location.hostname}:3000/public/games/Sounds/Victory.mp3`,
      (buffer) => {
        this.Victory = new THREE.Audio(sm.listener);
        this.Victory.setBuffer(buffer);
        this.Victory.setVolume(0.5);
      },
    );
    this.scene.add(this.model);

    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    this.radius = box.getSize(new THREE.Vector3()).length() / 2;
    this.boundingSphere = new THREE.Sphere(center, this.radius);
  }
}

export default Ball;
