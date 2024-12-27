import SceneManager from "./SceneManagerLocal";
import Table from "../Table";
import Paddle from "./PaddleLocal";
import Net from "../Net";
import Ball from "./BallLocal";
import { Clock } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../context/AuthContext";
import Toast from "../../../components/Toast";

const PongLocal = () => {
  const navigate = useNavigate();
  const sm = useRef(null);
  const loaderRef = useRef(null);
  const loaderTRef = useRef(null);
  const loaderBRef = useRef(null);
  const keyboard = useRef({});
  const authContextData = useContext(AuthContext);
  const [isOver, setIsOver] = useState(false);

  const tableRef = useRef(null);
  const netRef = useRef(null);
  const ballRef = useRef(null);
  const playersRef = useRef(null);

  useEffect(() => {
    loaderTRef.current = new GLTFLoader();
    loaderRef.current = new GLTFLoader();
    loaderBRef.current = new GLTFLoader();
    sm.current = new SceneManager(authContextData.setGlobalMessage, setIsOver);
    tableRef.current = new Table(sm.current.scene, loaderTRef.current);
    netRef.current = new Net(sm.current.scene, loaderRef.current);
    ballRef.current = new Ball(sm.current.scene, loaderBRef.current);

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
      },
    ];
    playersRef.current = [
      new Paddle(
        sm.current.scene,
        1,
        { x: 43, y: -25.5, z: 12 },
        controls[0],
        loaderRef.current,
        ballRef.current,
      ),
      new Paddle(
        sm.current.scene,
        -1,
        { x: -43, y: -25.5, z: -12 },
        controls[1],
        loaderRef.current,
        ballRef.current,
      ),
    ];

    sm.current.render();
    tableRef.current.render();
    netRef.current.render();
    ballRef.current.render(sm.current);
    playersRef.current[0].render();
    playersRef.current[1].render();

    const handleKeyDown = (event) => {
      keyboard.current[event.code] = true;
    };

    const handleKeyUp = (event) => {
      keyboard.current[event.code] = false;
    };

    const onWindowResize = () => {
      sm.current.camera.aspect = window.innerWidth / 2 / window.innerHeight;
      sm.current.camera.updateProjectionMatrix();
      sm.current.camera2.aspect = window.innerWidth / 2 / window.innerHeight;
      sm.current.camera2.updateProjectionMatrix();

      sm.current.renderer.setSize(window.innerWidth, window.innerHeight);
      sm.current.ScalePlan();
      sm.current.scoreRender(
        ballRef.current.scoreboard,
        ballRef.current.whoscore,
      );
      sm.current.addMatchPoint(ballRef.current.scoreboard);
      sm.current.TimeRender(false);
      sm.current.TimerCSS();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", onWindowResize, false);

    return () => {
      console.log("cleaned pong local");
      sm.current.listener.setMasterVolume(0);
      ballRef.current.cleanup();
      sm.current.cleanup();
      tableRef.current.cleanup();
      netRef.current.cleanup();
      playersRef.current[0].cleanup();
      playersRef.current[1].cleanup();
      sm.current.r();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  useEffect(() => {
    if (
      !tableRef.current ||
      !netRef.current ||
      !ballRef.current ||
      !playersRef.current ||
      !sm.current
    )
      return;

    const table = tableRef.current;
    const net = netRef.current;
    const ball = ballRef.current;
    const players = playersRef.current;

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
      ) {
        return;
      }
      const timeNow = performance.now() / 1000;
      let dt = clock.getDelta() * 1000;

      while (timeNow > simulatedTime + fixedStep) {
        ball.update(
          sm.current,
          net,
          table,
          players[0],
          players[1],
          fixedStep * 1000,
          keyboard.current,
        );
        simulatedTime += fixedStep;
      }
      if (ball.scoreboard[0] !== 7 && ball.scoreboard[1] !== 7) {
        if (Math.floor((Date.now() - sm.current.lastTime) / 1000) > 0)
          sm.current.TimerCSS();
      }

      const alpha = (timeNow - simulatedTime) / fixedStep;
      ball.x += ball.dx * alpha * fixedStep;
      ball.y += ball.dy * alpha * fixedStep;
      ball.z += ball.dz * alpha * fixedStep;

      players[0].update(keyboard.current, ball, dt);
      players[1].update(keyboard.current, ball, dt);
      sm.current.r();
    };
    sm.current.renderer.setAnimationLoop(animate);

    return () => {
      sm.current.renderer.setAnimationLoop(null);
    };
  }, [isOver]);

  function restart() {
    window.location.href = "/games/pong/local/PongLocal";
    window.close();
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {authContextData.globalMessage.message && (
        <Toast
          message={authContextData.globalMessage.message}
          error={authContextData.globalMessage.isError}
          onClose={authContextData.setGlobalMessage}
        />
      )}
      <canvas id="pong"></canvas>
      {isOver && (
        <div className="flex absolute inset-0 items-center justify-center bg-black bg-opacity-60 z-10">
          <div className="text-center transform scale-110">
            <img
              className="w-[250px] h-[250px] mx-auto transition-all transform hover:scale-110"
              src="/images/eto.gif"
              alt="Victory Dance"
            />
            <div className="mb-6 mt-8">
              <p className="text-5xl font-extrabold text-white animate__animated animate__bounceIn animate__delay-2000ms">
                GameOver
              </p>
              <p className="text-2xl font-semibold mt-4 text-white animate__animated animate__fadeIn animate__delay-4000ms">
                What A Good Game Champions!
              </p>

              <div className="flex flex-col gap-6 mt-12">
                <button
                  className="relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white uppercase transition-all duration-500 border-2 border-fuchsia-500 rounded-full shadow-lg hover:shadow-fuchsia-500/50 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-blue-500 hover:from-blue-500 hover:to-fuchsia-500 hover:scale-110"
                  onClick={() => navigate("/games/pong")}
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 via-yellow-500 to-red-400 opacity-0 transition-opacity duration-300 hover:opacity-50"></span>
                  <span className="z-10">Back To Pong</span>
                </button>

                <button
                  className="relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white uppercase transition-all duration-500 border-2 border-fuchsia-500 rounded-full shadow-lg hover:shadow-fuchsia-500/50 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-blue-500 hover:from-blue-500 hover:to-fuchsia-500 hover:scale-110"
                  onClick={restart}
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 via-yellow-500 to-red-400 opacity-0 transition-opacity duration-300 hover:opacity-50"></span>
                  <span className="z-10">Restart The Game</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PongLocal;
