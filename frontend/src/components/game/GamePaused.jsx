import { useNavigate } from "react-router-dom";

const GamePaused = ({ game }) => {
	const navigate = useNavigate();

	return (
		<div className="bg-black/50 absolute top-0 left-0 flex justify-center items-center w-full h-full overflow-y-auto no-scroll">
			<div className="container h-full flex justify-center items-center">
				<div className="primary-glass lg:w-[60%] md:w-[80%] w-[90%] lg:h-[50%] h-[70%] lg:grid flex grid-cols-[1fr_420px] overflow-hidden gap-16 items-center justify-center">
					<div className="p-16 flex flex-col gap-32 h-full justify-center items-center">
						<h1 className="font-bold text-h-lg-lg">{game} game paused</h1>
						<div className="flex flex-col gap-8 items-center normal-case tracking-wider">
							<div>this game has been paused by the player</div>
							<div>the game coming soon around 30s.</div>
						</div>
						<div className="flex flex-col gap-8 items-center">
							<p className="font-light text-gray text-txt-sm tracking-wide">you decided to play another game?</p>
							<div className="flex ">
								<button
									onClick={() => navigate('/games/')}
									className="secondary-glass p-8 px-16 transition-all flex gap-4 justify-center items-center
										hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
								>
									play another game
								</button>
							</div>
						</div>
					</div>
					<div className="h-full bg-[url(/images/gamePaused.jpeg)] bg-cover bg-center relative">
					<div className="absolute top-0 left-0 h-full w-full cover-gradient"></div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default GamePaused;