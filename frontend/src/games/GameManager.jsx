import { useState, useEffect, memo } from "react";
import { useParams } from "react-router-dom";
import Pong from "./pong/Pong";
import useWebSocket from "../customHooks/useWebsocket";

const Counter = ({ createdAt }) => {
  const endTime = new Date(createdAt).getTime() + 60 * 1000;
  const [count, setCount] = useState(endTime - Date.now())

  useEffect(() => {
    const updateTime = () => {
      if (endTime > Date.now())
        setCount(Math.floor((endTime - Date.now()) / 1000));
    }
    const intervalId = setInterval(updateTime, 1000)

    return () => clearInterval(intervalId);
  }, []);

  return <div>{count}</div>
}

const GameOverlay = ({ status, data, send }) => {
  console.log("status: ", status, data);
  switch (status) {
    case "waiting":
      return (
        <div className="flex flex-col gap-16 w-full justify-center items-center">
          <div className="flex gap-16">
            <span className={`normal-case ${data.players_details[0].ready ? "text-green" : "text-red"}`}>@{data.players_details[0].user.username}</span>
            <span className="normal-case">vs</span>
            <span className={`normal-case ${data.players_details[1].ready ? "text-green" : "text-red"}`}>@{data.players_details[1].user.username}</span>
          </div>
          <div className="flex gap-32">
            <span className="normal-case">+{data.players_details[0].rating_gain} -{data.players_details[0].rating_gain}</span>
            <span className="normal-case">+{data.players_details[0].rating_gain} -{data.players_details[0].rating_gain}</span>
          </div>
          <Counter createdAt={data.created_at} />
          <div className="flex justify-center">
            <button onClick={() => {
              send(JSON.stringify({
                type: "ready",
                message: {}
              }))
            }}>Accept</button>
          </div>
        </div>
      );
    case "expired":
      return <div>Game invite expired</div>
    case "ongoing":
      return <div>Game starting soon ...</div>
    default:
      return <>nn hh</>
  }
}

const Game = memo(({ game }) => {
  switch (game) {
    case "pong":
      return <div>pong</div>
    // return <Pong websocket={ws.current} player={playerNumber} />;
  }
})

const GameManager = () => {
  const [playerNumber, setPlayerNumber] = useState(-1);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState(null);
  const [data, setData] = useState(null);
  const { game, uuid } = useParams();
  const { send, addMessageHandler, removeMessageHandler } = useWebSocket(`wss://${window.location.hostname}:8000/ws/games/${uuid}`, {
    onMessage: (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "game_manager") {
        // INFO: check if the objects are the same to avoid unnecessary rerenders
        if (msg.message.status)
          setStatus(msg.message.status);
        console.log(msg);
        setData({
          ...data,
          ...msg.message,
        })
      }
      // switch (data.type) {
      //   case "accept":
      //   case "start": {
      //     setData({
      //       ...data.message,
      //       players_details: data.message.players_details,
      //     })
      //     break;
      //   }
      //   case "player_ready": {
      //     setData({
      //       ...data,
      //       players_details: data.message.players_details,
      //     })
      //   }
      // }
    }
  })

  // TODO: handle match accept
  // TODO: handle reconnect after accepting

  return (
    <>
      <div className="container items-center">
        <div className="primary-glass p-32">
          <GameOverlay status={status} data={data} send={send} />
        </div>
      </div>
      <Game game={game} />
    </>
  );
};
export default GameManager;
