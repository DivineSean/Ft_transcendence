import { useState, useEffect, useRef } from 'react';
import GameManager from './GameManager';

const Match = () => {

	const ws = useRef(null);
	const [match, setMatch] = useState(false);
	const [queue, setQueue] = useState(0);

	useEffect(() => {

		ws.current = new WebSocket(`wss://${window.location.hostname}:8000/ws/match/`);

		ws.current.onopen = () => console.log('Connected to Matchmaking service ...');
		ws.current.onclose = () => console.log('Matchmaking disconnected');
		ws.current.onerror = (e) => console.log('Error: ', e);

		ws.current.onmessage = (e) => {
			const msg = JSON.parse(e.data);
			console.log(msg)
			if (msg.type == 'update')
				setQueue(msg.message);
			else if (msg.type == 'match_found')
				setMatch(true);
		}

		return () => {
			if (ws.current)
				ws.current.close();
		}
	}, [])

	return (
		<>
			{match ? <GameManager /> : <h1>Matchmaking ... ({queue} players searching)</h1>}
		</>
	)

}

export default Match;
