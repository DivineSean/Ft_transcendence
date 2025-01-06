import { useState, useEffect, memo, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Pong from "./pong/Pong";
import useWebSocket from "../customHooks/useWebsocket";
import UserContext from "../context/UserContext.jsx";
import GamePaused from "../components/game/GamePaused.jsx";
import WaitingGame from "../components/game/WaitingGame.jsx";
import GameStatus from "../components/game/GameStatus.jsx";

const GameOverlay = ({ data, send, game }) => {
  const navigate = useNavigate();

  switch (data.status) {
    case "waiting":
      return <WaitingGame game={game} data={data} send={send} />;
    case "expired":
      return (
        <GameStatus
          game={game}
          title={"this game has been expired"}
          image={"/images/gameOver.png"}
        />
      );
    case "ongoing":
      return (
        <GameStatus
          game={game}
          title={"this game is ongoing"}
          image={"/images/gameOngoing.jpeg"}
        />
      );
    case "paused":
      return <GamePaused game={game} />;
    case "completed":
      return (
        <GameStatus
          game={game}
          title={"this game has been concluded"}
          image={"/images/gameOver.png"}
        />
      );
    default:
      navigate("/games/");
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
  }) => {
    const data = players.current?.find(
      (player) => player.user.username === userInfo.username,
    );
    console.log("hadi hya data dyali hhhh", userInfo?.username, players, data);

    useEffect(() => {
      console.log("Game component renered");
    }, []);

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
          />
        );
    }
  },
);

const GameManager = () => {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState(null);
  const { game, uuid } = useParams();
  const playersRef = useRef(null);
  const { send, addMessageHandler, removeMessageHandler } = useWebSocket(
    `wss://${window.location.hostname}:8000/ws/games/${game}/${uuid}`,
    {
      onMessage: (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "game_manager") {
          // INFO: check if the objects are the same to avoid unnecessary rerenders
          if (msg.message.status) setReady(msg.message.status === "ongoing");
          console.log(msg);
          if (msg.message.players) playersRef.current = msg.message.players;
          setData((prevData) => ({
            ...prevData,
            ...msg.message,
          }));
        }
      },
    },
  );

  useEffect(() => {
    console.log("this nigga's readiness: ", ready);
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
        />
      )}
      {!ready && data && <GameOverlay data={data} send={send} game={game} />}
    </div>
  );
};
export default GameManager;
