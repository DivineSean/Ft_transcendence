import SceneManager from "./SceneManager";
import Table from "./Table";
import Paddle from "./Paddle";
import Net from "./Net";
import Ball from "./Ball";
import { Clock } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect, useRef, useState, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import GameToast from "../../components/GameToast";
import JoystickController from "joystick-controller";
import { PiPingPongFill } from "react-icons/pi";
import { PiWarningBold } from "react-icons/pi";
import Toast from "@/components/Toast";

const Pong = ({
  send,
  ready,
  setReady,
  addMessageHandler,
  removeMessageHandler,
  player,
  turn,
  playersData,
  isSpectator,
  started_at,
  isWon,
  setIsWon,
  islost,
  setIslost,
}) => {
  const sm = useRef(null);
  const loaderRef = useRef(null);
  const loaderTRef = useRef(null);
  const loaderBRef = useRef(null);
  const tableRef = useRef(null);
  const netRef = useRef(null);
  const ballRef = useRef(null);
  const playersRef = useRef(null);
  const keyboard = useRef({});
  const isMobile = useRef(false);
  const authContextData = useContext(AuthContext);
  const [isPortrait, setIsPortrait] = useState(false);
  const [costumeMessage, setcostumeMessage] = useState(false);

  useEffect(() => {
    isMobile.current = /android|iphone|ipad|ipod/i.test(
      navigator.userAgent || window.opera,
    );

    if (!isMobile.current) return;
    setIsPortrait(true);

    if (!ready) return;

    const MobileEventListener = (event) => {
      if (isSpectator) return;
      if (event.x > 0.5) {
        keyboard.current["ArrowRight"] = true;
        keyboard.current["ArrowLeft"] = false;
      } else if (event.x < -0.5) {
        keyboard.current["ArrowLeft"] = true;
        keyboard.current["ArrowRight"] = false;
      } else {
        keyboard.current["ArrowRight"] = false;
        keyboard.current["ArrowLeft"] = false;
      }
      if (event.y > 0.5) {
        keyboard.current["ArrowUp"] = true;
        keyboard.current["ArrowDown"] = false;
      } else if (event.y < -0.5) {
        keyboard.current["ArrowDown"] = true;
        keyboard.current["ArrowUp"] = false;
      } else {
        keyboard.current["ArrowUp"] = false;
        keyboard.current["ArrowDown"] = false;
      }
    };

    const joystick = new JoystickController(
      {
        maxRange: 70,
        level: 10,
        radius: 50,
        joystickRadius: 30,
        opacity: 0.5,
        leftToRight: false,
        bottomToUp: true,
        containerClass: "joystick-container",
        controllerClass: "joystick-controller",
        joystickClass: "joystick",
        distortion: true,
        x: "15%",
        y: "25%",
        mouseClickButton: "ALL",
        hideContextMenu: false,
      },
      (data) => {
        MobileEventListener(data);
      },
    );

    return () => {
      if (isMobile.current && joystick) joystick.destroy();
      window.removeEventListener("resize", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
      if (screen.orientation?.unlock) {
        screen.orientation.unlock();
      }
    };
  }, [ready]);

  useEffect(() => {
    loaderTRef.current = new GLTFLoader();
    loaderRef.current = new GLTFLoader();
    loaderBRef.current = new GLTFLoader();
    sm.current = new SceneManager(
      player == 2 ? -1 : 1,
      turn,
      playersData,
      authContextData.setGlobalMessage,
      setIsWon,
      setIslost,
      setReady,
    );
    tableRef.current = new Table(sm.current.scene, loaderTRef.current);
    netRef.current = new Net(sm.current.scene, loaderRef.current);
    ballRef.current = new Ball(sm.current.scene, loaderBRef.current, player);
    const controls = {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      space: "Space",
    };

    playersRef.current = [
      new Paddle(
        sm.current.scene,
        1,
        { x: 43, y: -25.5, z: 12 },
        controls,
        loaderRef.current,
        ballRef.current,
      ),
      new Paddle(
        sm.current.scene,
        -1,
        { x: -43, y: -25.5, z: -12 },
        controls,
        loaderRef.current,
        ballRef.current,
      ),
    ];

    sm.current.render(started_at);
    tableRef.current.render();
    netRef.current.render();
    ballRef.current.render(sm.current);
    playersRef.current[0].render();
    playersRef.current[1].render();

    const messageHandler = (event) => {
      const msg = JSON.parse(event.data);
      if (isSpectator) {
        if (
          !tableRef.current ||
          !netRef.current ||
          !ballRef.current ||
          !playersRef.current ||
          !sm.current
        )
          return;
      }
      let opp = player == 1 ? 2 : 1;
      if (msg.type === "score") {
        const scores = JSON.parse(msg.message.scores);
        const score1 = Number(scores["1"]);
        const score2 = Number(scores["2"]);
        if (!isSpectator) {
          if (Math.abs(score1 - score2) === 4) {
            if (score1 > score2 && sm.current.RemontadaPlayer === -1)
              sm.current.RemontadaChance = true;
            else if (score1 < score2 && sm.current.RemontadaPlayer === 1)
              sm.current.RemontadaChance = true;
          }
          if (Math.abs(score1 - score2) === 0 && sm.current.RemontadaChance) {
            if (
              ballRef.current.audio &&
              ballRef.current.Achievement &&
              !ballRef.current.Achievement.isPlaying
            ) {
              ballRef.current.Achievement.currentTime = 0;
              ballRef.current.Achievement.play();
            }
            authContextData.setGlobalMessage({
              message:
                "From the brink of defeat to total domination. Truly inspiring!",
              title: "The Bounceback Boss",
            });
            send(
              JSON.stringify({
                type: "Achievements",
                message: "The Bounceback Boss",
              }),
            );
            sm.current.RemontadaChance = false;
          }
        }
        sm.current.scoreUpdate(send, scores, msg.message.role, ballRef.current);
        if (msg.message.role === 1) {
          ballRef.current.serve(netRef.current, 1);
        } else if (msg.message.role === 2) {
          ballRef.current.serve(netRef.current, -1);
        }
      } else if (msg.type === "update") {
        if (
          isSpectator &&
          (msg.message.content == "paddle" || msg.message.content == "rotating")
        ) {
          opp = msg.message.player;
          if (opp === -1) opp = 2;
        }
        if (msg.message.content == "paddle") {
          playersRef.current[opp - 1].rotating = false;
          playersRef.current[opp - 1].x = msg.message.paddle.x;
          playersRef.current[opp - 1].y = msg.message.paddle.y;
          playersRef.current[opp - 1].z = msg.message.paddle.z;

          playersRef.current[opp - 1].dx = msg.message.paddle.dx;
          playersRef.current[opp - 1].dy = msg.message.paddle.dy;
          playersRef.current[opp - 1].dz = msg.message.paddle.dz;

          playersRef.current[opp - 1].rotationX = msg.message.paddle.rotX;
          playersRef.current[opp - 1].rotationY = msg.message.paddle.rotY;
          playersRef.current[opp - 1].rotationZ = msg.message.paddle.rotZ;
          playersRef.current[opp - 1].updatePos();
        } else if (msg.message.content == "rotating") {
          if (
            ballRef.current.audio &&
            ballRef.current.swing &&
            !ballRef.current.swing.isPlaying
          ) {
            ballRef.current.swing.currentTime = 0;
            ballRef.current.swing.play();
          }
          playersRef.current[opp - 1].rotating = true;
          playersRef.current[opp - 1].rotationX = msg.message.paddle.rotX;
          playersRef.current[opp - 1].rotationY = msg.message.paddle.rotY;
          playersRef.current[opp - 1].rotationZ = msg.message.paddle.rotZ;
          playersRef.current[opp - 1].updatePos();
        } else if (msg.message.content == "ball") {
          if (msg.message.ball.stats === "shoot") {
            if (
              ballRef.current.audio &&
              ballRef.current.paddleHitSound &&
              !ballRef.current.paddleHitSound.isPlaying
            ) {
              ballRef.current.paddleHitSound.currentTime = 0;
              ballRef.current.paddleHitSound.play();
            }
          } else if (msg.message.ball.stats === "hit") {
            if (
              ballRef.current.audio &&
              ballRef.current.onlyHit &&
              !ballRef.current.onlyHit.isPlaying
            ) {
              ballRef.current.onlyHit.currentTime = 0;
              ballRef.current.onlyHit.play();
            }
          }
          ballRef.current.x = msg.message.ball.x;
          ballRef.current.y = msg.message.ball.y;
          ballRef.current.z = msg.message.ball.z;
          ballRef.current.dx = msg.message.ball.dx;
          ballRef.current.dy = msg.message.ball.dy;
          ballRef.current.dz = msg.message.ball.dz;
          ballRef.current.count = 0;
          ballRef.current.serving = msg.message.ball.serving;
          ballRef.current.lastshooter = msg.message.ball.lstshoot;
          ballRef.current.isServerDemon = false;
          ballRef.current.updatePos();
        } else if (msg.message.content == "lost") {
          ballRef.current.serving = msg.message.ball.serving;
          ballRef.current.lastshooter = msg.message.ball.lstshoot;
          ballRef.current.sendLock = true;
          ballRef.current.sendScore(send);
        }
      } else if (msg.type === "time") {
        sm.current.startTime = msg.message;
      }
    };

    addMessageHandler(messageHandler);
    const handleKeyDown = (event) => {
      ballRef.current.audioLoader(sm.current);
      setcostumeMessage(true);
      if (playersRef.current[player - 1].rotating || isSpectator) return;
      keyboard.current[event.code] = true;
    };

    const handleKeyUp = (event) => {
      keyboard.current[event.code] = false;
    };

    const onWindowResize = () => {
      sm.current.camera.aspect = window.innerWidth / window.innerHeight;
      sm.current.camera.updateProjectionMatrix();

      sm.current.renderer.setSize(window.innerWidth, window.innerHeight);
      ballRef.current.labelRenderer.setSize(
        window.innerWidth,
        window.innerHeight,
      );
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
      sm.current.cleanup();
      ballRef.current.cleanup();
      tableRef.current.cleanup();
      netRef.current.cleanup();
      playersRef.current[0].cleanup();
      playersRef.current[1].cleanup();
      removeMessageHandler(messageHandler);
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
        !ready ||
        !ball.model ||
        !net.boundingBox ||
        !table.boundingBoxTable ||
        !players[player - 1].boundingBox ||
        !ball.boundingSphere
      ) {
        ball.div.textContent = "";
        ball.startTime = Date.now();
        return;
      }
      if (
        ballRef.current.audio &&
        ballRef.current.BackgroundMusic &&
        !ball.BackgroundMusic.isPlaying
      ) {
        ball.BackgroundMusic.currentTime = 0;
        ball.BackgroundMusic.play();
      }
      const timeNow = performance.now() / 1000;
      let dt = clock.getDelta() * 1000;

      while (timeNow > simulatedTime + fixedStep) {
        ball.update(
          net,
          table,
          players[player - 1],
          send,
          fixedStep * 1000,
          player,
          keyboard.current,
          authContextData.setGlobalMessage,
          isSpectator,
        );
        simulatedTime += fixedStep;
      }
      if (!isSpectator) {
        if (ball.scoreboard[0] !== 7 && ball.scoreboard[1] !== 7) {
          if (ball.serving && !ball.timeout && !ball.sendLock) {
            if (
              (player === 1 && ball.lastshooter === 1) ||
              (player === 2 && ball.lastshooter === -1)
            ) {
              ball.CheckTimer(send);
              ball.labelRenderer.render(sm.current.scene, sm.current.camera);
            }
          }
        }
      }
      if (Math.floor((Date.now() - sm.current.lastTime) / 1000) > 0)
        sm.current.TimerCSS(send, ball);

      const alpha = (timeNow - simulatedTime) / fixedStep;
      ball.x += ball.dx * alpha * fixedStep;
      ball.y += ball.dy * alpha * fixedStep;
      ball.z += ball.dz * alpha * fixedStep;
      if (!isSpectator)
        players[player - 1].update(keyboard.current, ball, send, dt);
      const cameraDirection = sm.current.camera.position;
      sm.current.renderer.render(sm.current.scene, sm.current.camera);
      if (cameraDirection != sm.current.camera.position)
        sm.current.scoreUpdate();
    };

    sm.current.renderer.setAnimationLoop(animate);

    return () => sm.current.renderer.setAnimationLoop(null);
  }, [ready, isWon, islost]);

  const handleOrientation = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.documentElement.mozRequestFullScreen) {
        // Firefox
        document.documentElement.mozRequestFullScreen().catch(() => {});
      } else if (document.documentElement.webkitRequestFullscreen) {
        // Chrome, Safari
        document.documentElement.webkitRequestFullscreen().catch(() => {});
      } else if (document.documentElement.msRequestFullscreen) {
        // IE/Edge
        document.documentElement.msRequestFullscreen().catch(() => {});
      }
    } catch (error) {}
    if (screen.orientation?.lock) {
      screen.orientation.lock("landscape").catch(() => {});
    }
    setIsPortrait(false);
  };

  return (
    <div id="message" className="relative w-full h-screen overflow-hidden">
      {isMobile.current && ready && (
        <div className="absolute z-[1]">
          <button
            className="fixed bottom-2/3 left-[80px] flex items-center
            justify-center p-8 rounded-full shadow-2xl
						border-[0.5px] border-stroke-sc"
            onTouchStart={() => {
              ballRef.current.audioLoader(sm.current);
              setcostumeMessage(true);
              if (playersRef.current[player - 1].rotating) return;
              keyboard.current["Space"] = true;
            }}
            onTouchEnd={() => {
              keyboard.current["Space"] = false;
            }}
          >
            <PiPingPongFill className="text-txt-6xl text-stroke-sc transform scale-x-[-1]" />
          </button>
        </div>
      )}
      {authContextData.globalMessage?.message &&
        !authContextData.globalMessage?.title &&
        !isWon &&
        !islost && <Toast />}
      {authContextData.globalMessage?.message &&
        authContextData.globalMessage?.title &&
        !isWon &&
        !islost && (
          <GameToast
            duration={4000}
            message={authContextData.globalMessage.message}
            title={authContextData.globalMessage.title}
            onClose={authContextData.setGlobalMessage}
          />
        )}
      {isPortrait && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="w-[90%] secondary-glass p-8 py-16 flex flex-col gap-16">
            <div className="text-center px-4">
              <div className="flex justify-center">
                <PiWarningBold className="text-txt-2xl text-red" />
              </div>
              <h2 className="text-txt-2xl text-red uppercase">
                permission required
              </h2>
            </div>

            <p className="text-gray/80 text-md text-center px-8 lowercase">
              For the best Pong experience, please allow us to switch to
              landscape mode
            </p>

            <div className="flex gap-8 justify-center px-4 mt-8">
              <button
                onClick={handleOrientation}
                className="secondary-glass grow p-8 sm:px-16 transition-all flex gap-4 justify-center items-center
                        rounded-md font-semibold tracking-wide hover:bg-green/60 hover:text-black text-green"
              >
                Accept
              </button>
              <button
                onClick={() => {
                  send(
                    JSON.stringify({
                      type: "notready",
                      message: {},
                    }),
                  );
                }}
                className="secondary-glass grow p-8 sm:px-16 transition-all flex gap-4 justify-center items-center
                        rounded-md font-semibold tracking-wide hover:bg-red/60 hover:text-white text-red"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
      {isSpectator && !costumeMessage && (
        <div className="absolute w-full h-auto text-center overflow-hidden z-[2] p-16 animate-pulse">
          <h1>Spectator Mode</h1>
          <h2>Press Any key To Activate The Game Sound</h2>
        </div>
      )}
      <canvas id="pong" className="block"></canvas>
    </div>
  );
};
export default Pong;
