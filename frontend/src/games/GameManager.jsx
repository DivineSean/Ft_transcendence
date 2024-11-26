import React, { useState, useRef, useEffect, useCallback } from 'react';
import Pong from './pong/Pong';

const GameManager = ({ GameDetails }) => {
	const [playerNumber, setPlayerNumber] = useState(null);
	// const [ready, setReady] = useState(false);
	const ws = useRef(null);

	const connectWebSocket = useCallback(() => {
		const { id } = GameDetails.game;
		const role = GameDetails.role;
		ws.current = new WebSocket(`wss://${window.location.hostname}:8000/ws/games/${id}`);

		ws.current.onopen = () => {
			console.log('WebSocket connected');
			setPlayerNumber(role)
			ws.current.send(JSON.stringify({
				'type': 'ready',
				'message': {}
			}))
		};

		// ws.current.onmessage = (event) => {
		// 	const data = JSON.parse(event.data);
		// 	if (data.type === 'play') {
		// 		setReady(true);
		// 	}
		// 	console.log('Message from server:', data);
		// };

		ws.current.onclose = () => {
			console.log('WebSocket closed');
		};

		ws.current.onerror = (error) => {
			console.error('WebSocket error:', error);
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
			{!playerNumber ? (
				<button onClick={handleJoinGame}>Join Game</button>
			) : (
				<Pong websocket={ws.current} player={playerNumber} />
			)}
		</div>
	);
}

export default GameManager;
