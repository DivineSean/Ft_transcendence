import SceneManager from "./SceneManagerLocal";
import Table from "../Table";
import Paddle from "./PaddleLocal";
import Net from "../Net";
import Ball from "./BallLocal";
import { Clock } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect, useRef, useState, useContext } from "react";
import AuthContext from "../../../context/AuthContext";
import Toast from "../../../components/Toast";
import GameResultLan from "@/components/game/GameResultLan";
import { PiWarningBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const PongLocal = () => {
  const navigate = useNavigate();
  const sm = useRef(null);
  const loaderRef = useRef(null);
  const loaderTRef = useRef(null);
  const loaderBRef = useRef(null);
  const keyboard = useRef({});
  const authContextData = useContext(AuthContext);
  const [isOver, setIsOver] = useState(false);
  const [Players1, setPlayers1] = useState(false);

  const tableRef = useRef(null);
  const netRef = useRef(null);
  const ballRef = useRef(null);
  const playersRef = useRef(null);
  const isMobile = useRef(false);
  useEffect(() => {
    isMobile.current = /android|iphone|ipad|ipod/i.test(
      navigator.userAgent || window.opera,
    );
  }, []);

  useEffect(() => {
    loaderTRef.current = new GLTFLoader();
    loaderRef.current = new GLTFLoader();
    loaderBRef.current = new GLTFLoader();
    sm.current = new SceneManager(
      authContextData.setGlobalMessage,
      setIsOver,
      setPlayers1,
    );
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
        up: "ArrowUp",     // Player 2 - Arrow Up for up
        down: "ArrowDown", // Player 2 - Arrow Down for down
        left: "ArrowLeft", // Player 2 - Arrow Left for left
        right: "ArrowRight", // Player 2 - Arrow Right for right
        space: "Numpad0", 
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
    ballRef.current.render();
    playersRef.current[0].render();
    playersRef.current[1].render();

    const handleKeyDown = (event) => {
      ballRef.current.audioLoading(sm.current);
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
      if (ballRef.audio) sm.current.listener.setMasterVolume(0);
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
        !ball.boundingSphere
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

  const Gameover = ({ status }) => {
    const playersData = [
      { user: { username: "Player1", profile_image: null } },
      { user: { username: "Player2", profile_image: null } },
    ];

    return (
      <>
        <GameResultLan playersData={playersData} isWon={status} />
      </>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {authContextData.globalMessage.message && (
        <Toast
          message={authContextData.globalMessage.message}
          error={authContextData.globalMessage.isError}
          onClose={authContextData.setGlobalMessage}
        />
      )}
      {!isMobile.current && <canvas id="pong"></canvas>}
      {isMobile.current && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="w-[90%] secondary-glass p-8 py-16 flex flex-col gap-16">
            <div className="text-center px-4">
              <div className="flex justify-center">
                <PiWarningBold className="text-txt-2xl text-red" />
              </div>
              <h1 className="text-txt-2xl text-red uppercase">Warning:</h1>
              <h2 className="text-txt-1xl text-white uppercase">
                Unsupported Mode
              </h2>
            </div>

            <p className="text-gray/80 text-md text-center px-8 lowercase">
              Please ensure your device meets the necessary requirements to run
              this mode.
            </p>

            <div className="flex gap-8 justify-center px-4 mt-8">
              <button
                onClick={() => {
                  navigate(`/games/pong`);
                }}
                className="secondary-glass grow p-8 sm:px-16 transition-all flex gap-4 justify-center items-center
                        rounded-md font-semibold tracking-wide hover:bg-red/60 hover:text-white text-red"
              >
                I UNDERSTAND
              </button>
            </div>
          </div>
        </div>
      )}
      {isOver && <Gameover status={Players1} />}
    </div>
  );
};

export default PongLocal;
