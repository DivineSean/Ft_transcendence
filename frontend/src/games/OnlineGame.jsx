import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GameManager from "./GameManager";

const OnlineGame = ({ game = "" }) => {
    const [playerCount, setPlayerCount] = useState(0);
    const [inQueue, setInQueue] = useState(false);
    const navigate = useNavigate();
    const ws = useRef(null);

    useEffect(() => {
        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const handleStartQueue = () => {
        setInQueue(true);

        ws.current = new WebSocket(
            `wss://${window.location.hostname}:8000/ws/matchmaking/${game}`,
        );

        ws.current.onopen = () => {
            console.log("Matchmaking ws connected");
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.type == "update") setPlayerCount(data.message);
            else if (data.type == "match_found") {
                navigate(`${data.message.game.id}`, { state: data.message })
            }
        };

        ws.current.onclose = () => {
            console.log("Matchmaking ws disconnected");
        };
    };

    const handleLeaveQueue = () => {
        setInQueue(false);

        if (ws.current) {
            ws.current.close();
            ws.current = null;
            setPlayerCount(0);
        }
    };

    return (
        <div className="h-full flex flex-col justify-center items-center p-8">
            <div className="nes-container is-rounded is-centered with-title">
                <h1 className="title">Matchmaking Queue</h1>
                <p>Players searching: {playerCount}</p>
                <button
                    className={`nes-btn ${inQueue ? "is-error" : "is-primary"}`}
                    onClick={inQueue ? handleLeaveQueue : handleStartQueue}
                >{inQueue ? "Cancel" : "Start"}</button>
            </div>
        </div >
    );
};

export default OnlineGame;
