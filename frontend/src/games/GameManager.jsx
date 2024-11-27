import React, { useState, useRef, useEffect, useCallback } from "react";
import Pong from "./pong/Pong";

const GameManager = ({ GameDetails }) => {
  const [playerNumber, setPlayerNumber] = useState(-1);
  // const [ready, setReady] = useState(false);
  const ws = useRef(null);

  const connectWebSocket = useCallback(() => {
    const { id } = GameDetails.game;
    const role = GameDetails.role;
    console.log(id, role);
    ws.current = new WebSocket(
      `wss://${window.location.hostname}:8000/ws/games/${id}`,
    );

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      ws.current.send(
        JSON.stringify({
          type: "ready",
          message: {},
        }),
      );
      setPlayerNumber(role);
    };

    ws.current.onmessage = (e) =>
      console.log("message tzeft: ", JSON.parse(e.data));
    // ws.current.onmessage = (event) => {
    // 	const data = JSON.parse(event.data);
    // 	if (data.type === 'play') {
    // 		setReady(true);
    // 	}
    // 	console.log('Message from server:', data);
    // };

    ws.current.onclose = () => {
      console.log("WebSocket closed");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, []);

  const handleJoinGame = () => {
    if (!ws.current) {
      connectWebSocket();
    }
  };

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <div>
      {playerNumber === -1 ? (
        <button onClick={handleJoinGame}>Join Game</button>
      ) : (
        <Pong websocket={ws.current} player={playerNumber} />
      )}
    </div>
  );
};

export default GameManager;
