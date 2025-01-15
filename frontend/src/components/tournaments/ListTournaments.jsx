import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import AuthContext from "@/context/AuthContext";
import FetchWrapper from "@/utils/fetchWrapper";
import { RxCross2 } from "react-icons/rx";
import { PiPlusBold } from "react-icons/pi";

const FetchData = new FetchWrapper();

const getTournaments = async (offset, setTourOffset, authContextData, setTournaments) => {
	try {
		const res = await FetchData.get(`api/tournaments/${offset}/`);
		if (res.ok) {
			const data = await res.json();
			setTourOffset(data.nextOffset);
			setTournaments(data.tournaments);
		}
	} catch (error) {
		authContextData.setGlobalMessage({
			message: error.message,
			isError: true
		});
	}
};

const ListTournaments = ({tournaments, setTournaments}) => {
	const authContextData = useContext(AuthContext);
	const endTourRef = useRef(null);
	const tourContainerRef = useRef(null);
  const navigate = useNavigate();
	const [tourOffset, setTourOffset] = useState(0);

	useEffect(() => {
		if (!tournaments) {
			getTournaments(tourOffset, setTourOffset, authContextData, setTournaments);
		}
	}, [tournaments]);

	if (tourContainerRef && tourContainerRef.current) {
		tourContainerRef.current.addEventListener('scroll', () => {
			const isAtEnd = tourContainerRef.current.scrollTop + tourContainerRef.current.clientHeight >= tourContainerRef.current.scrollHeight;
			if (isAtEnd) {
				tourContainerRef.current.scrollBy({ top: -40, behavior: 'smooth' });
				console.log('sf rah salat abroooo');
			}
		})
	}

	const deleteTournament = async () => {
		try {
			const res = await FetchData.delete('api/tournaments/');
			if (res.ok) {
				setTournaments(null);
				authContextData.setGlobalMessage({
					message: "the tournament deleted successfully",
					isError: false,
				});
			}
		} catch (error) {
			authContextData.setGlobalMessage({
				message: error.message,
				isError: true,
			});
		}
	}

	const joinTournament = async (tournamentId) => {
		try {
			const res = await FetchData.put('api/tournaments/', {
				id: tournamentId
			});
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				authContextData.setGlobalMessage({
					message: data.message,
					isError: false,
				});
				setTournaments(null);
			} else if (res.status === 400) {
				const data = await res.json();
				authContextData.setGlobalMessage({
					message: data.error,
					isError: true,
				});
			}
		} catch (error) {
			authContextData.setGlobalMessage({
				message: error.message,
				isError: true,
			})
		}
	}

	return (
		<div ref={tourContainerRef} className="h-full w-full overflow-y-auto no-scrollbar p-16 flex flex-col gap-16">			
			{tournaments && tournaments.map((tournament) => (
				<div key={tournament.id} className="flex gap-32 p-16 bg-gray/5 rounded-lg border border-gray/10 items-center">
					<div
						onClick={() => navigate(`/tournaments/${tournament.id}`)}
						className="w-full flex gap-16 justify-between items-center cursor-pointer"
					>
						<div className="flex flex-col gap-4">
							<h1 className="font-bold tracking-wider">{tournament.tournamentTitle}</h1>
							<p className="text-txt-sm tracking-wider">{tournament.gameData.name}</p>
						</div>
						<div className="text-gray">{tournament.created_at}</div>
						<div className="flex flex-col gap-4 items-center">
							<h1 className="tracking-wider">{tournament.currentPlayerCount}/{tournament.maxPlayers}</h1>
							<p className="text-txt-sm tracking-wider font-bold">players</p>
						</div>
						<div className="flex flex-col gap-4 items-center">
							<h1 className="font-bold tracking-wider">registrations</h1>
							{tournament.currentPlayerCount < tournament.maxPlayers ?
								<p className="text-txt-sm tracking-wider text-green font-bold">open</p>
								:
								<p className="text-txt-sm tracking-wider text-red font-bold">closed</p>
							}
						</div>
					</div>
					{tournament.isCreator && 
						<RxCross2 onClick={deleteTournament} className="text-red text-h-lg-md cursor-pointer"/>
					}
					{!tournament.isCreator && tournament.maxPlayers !== tournament.currentPlayerCount &&
						<PiPlusBold onClick={() => joinTournament(tournament.id)} className="text-green text-h-lg-md cursor-pointer"/>
					}
				</div>
			))}
			<span ref={endTourRef} className={`text-center text-txt-sm text-green ${tourOffset ? 'block' : 'hidden'}`}>loading...</span>
			{tournaments && tournaments.length === 0 && <div className="text-center text-stroke-sc">no tournaments</div> }
		</div>
	)
}

export default ListTournaments;