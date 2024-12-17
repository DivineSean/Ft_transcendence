import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Pong from "./pong/Pong";

const GameManager = () => {
  const [playerNumber, setPlayerNumber] = useState(-1);
  // const [ready, setReady] = useState(false);
  const ws = useRef(null);
  const [players, setPlayers] = useState([]);

  // TODO: handle match accept
  // TODO: handle reconnect after accepting
  const location = useLocation();
  const gameDetails = location.state;
  console.log("game state: ", gameDetails);

  const connectWebSocket = useCallback(() => {
    const { id } = gameDetails.game;
    const role = gameDetails.role;
    setPlayers(gameDetails.game.players_details.map(player => player.user.username));
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
        <Pong websocket={ws.current} player={playerNumber} names={players}/>
      )}
    </div>
  );
};
export default GameManager;
