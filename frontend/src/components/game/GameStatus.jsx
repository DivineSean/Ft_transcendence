import { useNavigate } from "react-router-dom";

const GameStatus = ({ game, title, image }) => {
	const navigate = useNavigate();
	
	return (
		<div className="bg-black/50 absolute top-0 left-0 flex justify-center items-center w-full h-full overflow-y-auto no-scroll">
			<div className="container h-full flex justify-center items-center">
				<div className="primary-glass w-full lg:h-[50%] h-[70%] lg:grid flex lg:grid-cols-[1fr_520px] overflow-hidden gap-16 items-center justify-center">
					<div className="p-16 flex flex-col gap-32 h-full justify-center items-center">
						<h1 className="font-bold text-h-lg-lg">{game} game</h1>
						<div className="normal-case tracking-wider text-center">{title}</div>
						<div className="flex gap-16">
							<button
								onClick={() => navigate('/games/')}
								className="secondary-glass p-8 px-16 transition-all flex gap-4 justify-center items-center
									hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
							>
								find another game
							</button>
							<button
								onClick={() => navigate(-1)}
								className="secondary-glass p-8 px-16 transition-all flex gap-4 justify-center items-center
									hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
							>
								go back
							</button>
						</div>
					</div>
					<div style={{ backgroundImage: `url(${image})`}} className="h-full bg-cover bg-center relative">
					<div className="absolute top-0 left-0 h-full w-full cover-gradient"></div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default GameStatus;