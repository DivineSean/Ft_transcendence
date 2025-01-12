import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../customHooks/useWebsocket";

const OnlineGame = ({ game = "" }) => {
  const [playerCount, setPlayerCount] = useState(0);
  const [inQueue, setInQueue] = useState(false);
  const navigate = useNavigate();
  const { send } = useWebSocket(`ws/matchmaking/${game}`, {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.type == "update") setPlayerCount(data.message);
      else if (data.type == "match_found") {
        navigate(`${data.message.room_id}`);
      }
    },
  });

  const handleStartQueue = () => {
    setInQueue(true);

    send(
      JSON.stringify({
        type: "join_queue",
        message: {},
      }),
    );
  };

  const handleLeaveQueue = () => {
    setInQueue(false);

    send(
      JSON.stringify({
        type: "leave_queue",
        message: {},
      }),
    );
  };

  return (
    <div className="h-full flex flex-col justify-center items-center p-8">
      <div className="nes-container is-rounded is-centered with-title">
        <h1 className="title">Matchmaking Queue</h1>
        <p>Players searching: {playerCount}</p>
        <button
          className={`nes-btn ${inQueue ? "is-error" : "is-primary"}`}
          onClick={inQueue ? handleLeaveQueue : handleStartQueue}
        >
          {inQueue ? "Cancel" : "Start"}
        </button>
      </div>
    </div>
  );
};

export default OnlineGame;
