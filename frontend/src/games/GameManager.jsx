import { useState, useEffect, memo, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Pong from "./pong/Pong";
import useWebSocket from "../customHooks/useWebsocket";
import UserContext from "../context/UserContext.jsx";
import GamePaused from "../components/game/GamePaused.jsx";
import WaitingGame from "../components/game/WaitingGame.jsx";
import GameStatus from "../components/game/GameStatus.jsx";
import AuthContext from "../context/AuthContext.jsx";
import GameResult from "../components/game/GameResult.jsx";

const GameOverlay = ({
  data,
  send,
  game,
  isS,
  islost,
  isWon,
  userInfo,
  players,
  decline,
  setGlobalMessage,
}) => {
  const navigate = useNavigate();

  let TimeoutWin = isWon;
  let TimeoutLoss = islost;

  const dats = players.current?.find(
    (player) => player.user.username === userInfo.username,
  );

  if (dats && dats.result === "win") {
    TimeoutWin = true;
  } else if (dats && dats.result === "loss") {
    TimeoutLoss = true;
  }

  switch (data.status) {
    case "waiting":
      return (
        <WaitingGame
          game={game}
          data={data}
          send={send}
          decline={decline.current}
          setGlobalMessage={setGlobalMessage}
        />
      );
    case "expired":
      return (
        <GameStatus
          game={game}
          title={"This game has expired"}
          image={"/images/gameOver.png"}
        />
      );
    case "paused":
      return (
        <GamePaused
          game={game}
          image={"/images/gamePaused.jpeg"}
          isS={isS}
          isRanked={data.players[0].rating_gain}
        />
      );
    case "completed":
      return (
        <>
          {isS ? (
            <GameStatus
              game={game}
              title={"This game has concluded"}
              image={"/images/gameOver.png"}
            />
          ) : (
            <>
              {TimeoutWin && (
                <GameResult playersData={data.players} isWon={true} />
              )}
              {TimeoutLoss && (
                <GameResult playersData={data.players} isWon={false} />
              )}
            </>
          )}
        </>
      );
    default:
      () => navigate(`/games/${game}/online`);
  }
};

const Game = memo(
  ({
    userInfo,
    game,
    ready,
    setReady,
    send,
    addMessageHandler,
    removeMessageHandler,
    players,
    turn,
    started_at,
    setisS,
    isWon,
    islost,
    setIsWon,
    setIslost,
  }) => {
    const data = players.current?.find(
      (player) => player.user.username === userInfo.username,
    );

    useEffect(() => {
      setisS(data ? false : true);
    }, [players, userInfo.username]);

    const overideSend = () => {
      return;
    };

    switch (game) {
      case "pong":
        return (
          <Pong
            send={data ? send : overideSend}
            ready={ready}
            setReady={setReady}
            addMessageHandler={addMessageHandler}
            removeMessageHandler={removeMessageHandler}
            player={data ? data.role : 1}
            turn={turn}
            playersData={players.current}
            isSpectator={data ? false : true}
            started_at={started_at}
            isWon={isWon}
            setIsWon={setIsWon}
            islost={islost}
            setIslost={setIslost}
          />
        );
    }
  },
);

const GameManager = () => {
  const [ready, setReady] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [islost, setIslost] = useState(false);
  const [isS, setisS] = useState(true);
  const [data, setData] = useState(null);
  const { game, uuid } = useParams();
  const playersRef = useRef(null);
  const declineRef = useRef("no");
  const authContextData = useContext(AuthContext);
  const navigate = useNavigate();
  function strictGreaterThanOrEqual(a, b) {
    if (typeof a !== "number" || typeof b !== "number") {
      return false;
    }
    return a >= b;
  }
  const { send, addMessageHandler, removeMessageHandler } = useWebSocket(
    `ws/games/${game}/${uuid}`,
    {
      onMessage: (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "game_manager") {
          // INFO: check if the objects are the same to avoid unnecessary rerenders
          if (msg.message.status) setReady(msg.message.status === "ongoing");
          console.log(msg);
          if (msg.message.players) playersRef.current = msg.message.players;
          if (msg.message.r && msg.message.r === "no")
            declineRef.current = "yes";
          setData((prevData) => ({
            ...prevData,
            ...msg.message,
          }));
        }
      },
      onClose: (event) => {
        if (strictGreaterThanOrEqual(event.code, 4000)) {
          console.log("Navigating...");
          navigate(`/games/${game}/online`);
          authContextData.setGlobalMessage({
            message: event.reason,
            isError: true,
          });
        }
      },
    },
  );

  useEffect(() => {
    console.log("this nigga's readiness: ", ready);
    console.log("this wonlost is : ==> ", isS);
  }, [ready]);

  const contextData = useContext(UserContext);
  useEffect(() => {
    contextData.getUserInfo();
  }, []);

  console.log(game);
  return (
    <div className="relative w-full">
      {contextData.userInfo && playersRef.current && (
        <Game
          game={game}
          ready={ready}
          setReady={setReady}
          send={send}
          userInfo={contextData.userInfo}
          addMessageHandler={addMessageHandler}
          removeMessageHandler={removeMessageHandler}
          players={playersRef}
          turn={data.turn}
          started_at={data.started_at}
          setisS={setisS}
          isWon={isWon}
          islost={islost}
          setIsWon={setIsWon}
          setIslost={setIslost}
        />
      )}
      {!ready && data && (
        <GameOverlay
          data={data}
          send={send}
          game={game}
          isS={isS}
          islost={islost}
          isWon={isWon}
          userInfo={contextData.userInfo}
          players={playersRef}
          decline={declineRef}
          setGlobalMessage={authContextData.setGlobalMessage}
        />
      )}
    </div>
  );
};
export default GameManager;
