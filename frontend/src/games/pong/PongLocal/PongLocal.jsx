import SceneManager from "./SceneManagerLocal";
import Table from "../Table";
import Paddle from "./PaddleLocal";
import Net from "../Net";
import Ball from "./BallLocal";
import { Clock } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect, useRef, useState } from "react";

const PongLocal = () => {
  const sm = useRef(null);
  const loaderRef = useRef(null);
  const loaderTRef = useRef(null);
  const loaderBRef = useRef(null);
  const keyboard = useRef({});

  useEffect(() => {
    loaderTRef.current = new GLTFLoader();
    loaderRef.current = new GLTFLoader();
    loaderBRef.current = new GLTFLoader();
    sm.current = new SceneManager();

    const table = new Table(sm.current.scene, loaderTRef.current);
    const net = new Net(sm.current.scene, loaderRef.current);
    const ball = new Ball(sm.current.scene, loaderBRef.current);

    const controls = [
      {
        up: "KeyW",         
        down: "KeyS",      
        left: "KeyA",      
        right: "KeyD",      
        space: "Space",    
      },
      {
        up: "Numpad8", 
        down: "Numpad2", 
        left: "Numpad4",    
        right: "Numpad6",   
        space: "ShiftRight",
      }
    ];
    const players = [
      new Paddle(
        sm.current.scene,
        1,
        { x: 43, y: -25.5, z: 12 },
        controls[0],
        loaderRef.current,
        ball,
      ),
      new Paddle(
        sm.current.scene,
        -1,
        { x: -43, y: -25.5, z: -12 },
        controls[1],
        loaderRef.current,
        ball,
      ),
    ];


    sm.current.render();
    table.render();
    net.render();
    ball.render(sm.current);
    players[0].render();
    players[1].render();

    let simulatedTime = performance.now() / 1000;
    const fixedStep = 0.015;
    const clock = new Clock();

    const animate = () => {
      if (
        !ball.model ||
        !net.boundingBox ||
        !table.boundingBoxTable ||
        !players[0].boundingBox ||
        !players[1].boundingBox ||
        !ball.boundingSphere ||
        !ball.bounceSound ||
        !ball.netHitSound ||
        !ball.paddleHitSound ||
        !ball.onlyHit ||
        !ball.swing ||
        !ball.scoreSound ||
        !ball.BackgroundMusic ||
        !ball.lostSound ||
        !ball.ballMatchPoint ||
        !ball.Defeat ||
        !ball.Victory
      )
        return;
      if (!ball.BackgroundMusic.isPlaying) {
        ball.BackgroundMusic.currentTime = 0;
        ball.BackgroundMusic.play();
      }
      const timeNow = performance.now() / 1000;
      let dt = clock.getDelta() * 1000;

      table.update();
      while (timeNow > simulatedTime + fixedStep) {
        ball.update(sm.current,
          net,
          table,
          players[0],
          players[1],
          fixedStep * 1000,
          keyboard.current,
        );
        simulatedTime += fixedStep;
      }
      if (Math.floor((Date.now() - sm.current.lastTime) / 1000) > 0)
        sm.current.TimerCSS();

      const alpha = (timeNow - simulatedTime) / fixedStep;
      ball.x += ball.dx * alpha * fixedStep;
      ball.y += ball.dy * alpha * fixedStep;
      ball.z += ball.dz * alpha * fixedStep;

      players[0].update(keyboard.current, ball, dt);
      players[1].update(keyboard.current, ball, dt);
      sm.current.r();
    };

    sm.current.renderer.setAnimationLoop(animate);
    const handleKeyDown = (event) => {
      // if (players[player - 1].rotating) return;
      keyboard.current[event.code] = true;
    };

    const handleKeyUp = (event) => {
      keyboard.current[event.code] = false;
    };
    
    const onWindowResize = () => {
      sm.current.camera.aspect = (window.innerWidth / 2) / window.innerHeight;
      sm.current.camera.updateProjectionMatrix();
      sm.current.camera2.aspect = (window.innerWidth / 2) / window.innerHeight;
      sm.current.camera2.updateProjectionMatrix();

      sm.current.renderer.setSize(window.innerWidth, window.innerHeight);
      sm.current.ScalePlan();
      sm.current.scoreRender(ball.scoreboard, ball.whoscore);
      sm.current.TimeRender(false);
      sm.current.TimerCSS();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", onWindowResize, false);

    return () => {
      sm.current.cleanUp();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);
  return <canvas id="pong"></canvas>;
};

export default PongLocal;
