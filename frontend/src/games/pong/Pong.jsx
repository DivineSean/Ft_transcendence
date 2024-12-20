import SceneManager from "./SceneManager";
import Table from "./Table";
import Paddle from "./Paddle";
import Net from "./Net";
import Ball from "./Ball";
import { Clock } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect, useRef, useState, useContext } from "react";
import AuthContext from '../../context/AuthContext';
import Toast from '../../components/Toast';

let dt = 1; ////added for debugging purpose
const Pong = ({ websocket, player, names }) => {
  const sm = useRef(null);
  const loaderRef = useRef(null);
  const loaderTRef = useRef(null);
  const loaderBRef = useRef(null);
  const keyboard = useRef({});
  let [ready, setReady] = useState(false);
  const authContextData = useContext(AuthContext);

  useEffect(() => {
    loaderTRef.current = new GLTFLoader();
    loaderRef.current = new GLTFLoader();
    loaderBRef.current = new GLTFLoader();
    sm.current = new SceneManager(player == 2 ? -1 : 1, names, authContextData.setGlobalMessage);
    const table = new Table(sm.current.scene, loaderTRef.current);
    const net = new Net(sm.current.scene, loaderRef.current);
    const ball = new Ball(sm.current.scene, loaderBRef.current, player);
    const controls = {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      space: "Space",
    };

    const players = [
      new Paddle(
        websocket,
        sm.current.scene,
        1,
        { x: 43, y: -25.5, z: 12 },
        controls,
        loaderRef.current,
        ball,
      ),
      new Paddle(
        websocket,
        sm.current.scene,
        -1,
        { x: -43, y: -25.5, z: -12 },
        controls,
        loaderRef.current,
        ball,
      ),
    ];
    let lastServerBallUpdate = Date.now();
    // override ws onmessage
    websocket.onmessage = (event) => {
      // console.log(event);
      const msg = JSON.parse(event.data);
      const opp = player == 1 ? 2 : 1;
      if (msg.type === "score") {
        const scores = JSON.parse(msg.message.scores);
        const score1 = Number(scores["1"]);
        const score2 = Number(scores["2"]);
        if (Math.abs(score1 - score2) === 4)
        {
          if (score1 > score2 && sm.current.RemontadaPlayer === 2)
            sm.current.RemontadaChance = true;
          else if (score1 < score2 && sm.current.RemontadaPlayer === 1)
            sm.current.RemontadaChance = true;
        }
        else if (Math.abs(score1 - score2) === 0 && sm.current.RemontadaChance)
        {
          authContextData.setGlobalMessage({message: 'Bounceback Boss Achieved', isError: false});
          sm.current.RemontadaChance = false;
        }
        ready = sm.current.scoreUpdate(scores, msg.message.role, ball);
        if (msg.message.role === 1) {
          ball.serve(websocket, net, 1);
        } else if (msg.message.role === 2) {
          ball.serve(websocket, net, -1);
        }
      } else if (msg.type == "play") setReady(true);
      else if (msg.message.content == "paddle") {
        players[opp - 1].rotating = false;
        players[opp - 1].x = msg.message.paddle.x;
        players[opp - 1].y = msg.message.paddle.y;
        players[opp - 1].z = msg.message.paddle.z;

        players[opp - 1].dx = msg.message.paddle.dx;
        players[opp - 1].dy = msg.message.paddle.dy;
        players[opp - 1].dz = msg.message.paddle.dz;

        players[opp - 1].rotationX = msg.message.paddle.rotX;
        players[opp - 1].rotationY = msg.message.paddle.rotY;
        players[opp - 1].rotationZ = msg.message.paddle.rotZ;
        players[opp - 1].updatePos();
      } else if (msg.message.content == "rotating") {
        if (!ball.swing.isPlaying) {
          ball.swing.currentTime = 0;
          ball.swing.play();
        }
        players[opp - 1].rotating = true;
        players[opp - 1].rotationX = msg.message.paddle.rotX;
        players[opp - 1].rotationY = msg.message.paddle.rotY;
        players[opp - 1].rotationZ = msg.message.paddle.rotZ;
        players[opp - 1].updatePos();
      } else if (msg.message.content == "ball") {
        if (msg.message.ball.stats === "shoot") {
          if (!ball.paddleHitSound.isPlaying) {
            ball.paddleHitSound.currentTime = 0;
            ball.paddleHitSound.play();
          }
        } else if (msg.message.ball.stats === "hit") {
          if (!ball.onlyHit.isPlaying) {
            ball.onlyHit.currentTime = 0;
            ball.onlyHit.play();
          }
        }
        ball.x = msg.message.ball.x;
        ball.y = msg.message.ball.y;
        ball.z = msg.message.ball.z;
        ball.dx = msg.message.ball.dx;
        ball.dy = msg.message.ball.dy;
        ball.dz = msg.message.ball.dz;
        ball.count = 0;
        ball.serving = msg.message.ball.serving;
        ball.lastshooter = msg.message.ball.lstshoot;
        ball.isServerDemon = false;
        ball.updatePos();
      } else if (msg.message.content == "lost") {
        ball.serving = msg.message.ball.serving;
        ball.lastshooter = msg.message.ball.lstshoot;
        ball.sendLock = true;
        ball.sendScore(websocket);
      }
    };
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
        !ready ||
        !ball.model ||
        !net.boundingBox ||
        !table.boundingBoxTable ||
        !players[player - 1].boundingBox ||
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
        ball.update(
          net,
          table,
          players[player - 1],
          websocket,
          fixedStep * 1000,
          player,
          keyboard.current,
          authContextData.setGlobalMessage,
        );
        simulatedTime += fixedStep;
      }

      if (ball.serving && !ball.timeout && !ball.sendLock) {
        if (
          (player === 1 && ball.lastshooter === 1) ||
          (player === 2 && ball.lastshooter === -1)
        ) {
          ball.CheckTimer(websocket);
          ball.labelRenderer.render(sm.current.scene, sm.current.camera);
        }
      }
      if (Math.floor((Date.now() - sm.current.lastTime) / 1000) > 0)
        sm.current.TimerCSS();

      const alpha = (timeNow - simulatedTime) / fixedStep;
      ball.x += ball.dx * alpha * fixedStep;
      ball.y += ball.dy * alpha * fixedStep;
      ball.z += ball.dz * alpha * fixedStep;

      players[player - 1].update(keyboard.current, ball, websocket, dt);
      const cameraDirection = sm.current.camera.position;
      sm.current.renderer.render(sm.current.scene, sm.current.camera);
      if (cameraDirection != sm.current.camera.position)
        sm.current.scoreUpdate();
    };

    sm.current.renderer.setAnimationLoop(animate);
    const handleKeyDown = (event) => {
      if (players[player - 1].rotating) return;
      keyboard.current[event.code] = true;
    };

    const handleKeyUp = (event) => {
      keyboard.current[event.code] = false;
    };

    const onWindowResize = () => {
      sm.current.camera.aspect = window.innerWidth / window.innerHeight;
      sm.current.camera.updateProjectionMatrix();

      sm.current.renderer.setSize(window.innerWidth, window.innerHeight);
      ball.labelRenderer.setSize(window.innerWidth, window.innerHeight);
      sm.current.ScalePlan();
      sm.current.scoreRender(ball.scoreboard, ball.whoscore);
      sm.current.addMatchPoint(ball.scoreboard);
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
  }, [ready]);

  return (
    <div id="message" className="relative w-full h-screen overflow-hidden">
      {authContextData.globalMessage.message && (
        <Toast
          message={authContextData.globalMessage.message}
          error={authContextData.globalMessage.isError}
          onClose={authContextData.setGlobalMessage}
        />
      )}
      <canvas id="pong" className="block"></canvas>
    </div>
  );
};

export default Pong;
