import { MdGames } from "react-icons/md";
import { FaFire } from "react-icons/fa6";

const ProfileOverview  = () => {
    return (
			<div className='flex gap-32 grow overflow-y-scroll no-scrollbar'>
				<div className='flex flex-col h-[288px] w-[100px] grow xl:grow rounded-[8px] border-[0.5px] border-stroke-sc overflow-hidden'>
					<div className='md:p-32 p-16 relative h-[150px] overflow-hidden flex items-end bg-[url("/images/pong-overview.webp")] bg-cover bg-center'>
						<div className='absolute top-0 left-0 w-full h-full overflow-hidden cover-gradient'></div>
						<h2 className='absolute font-bold md:text-h-lg-lg text-h-sm-lg'>ping pong</h2>
					</div>
					<div className='flex md:px-32 px-16 py-16 gap-32 h-[69px] items-center'>
						<MdGames className="text-green text-txt-3xl" />
						<div className='flex gap-40 justify-between grow'>
							<div className='flex flex-col items-start'>
								<span className='text-h-lg-sm'>12</span>
								<span className='text-txt-xs'>total played</span>
							</div>
							<div className='flex flex-col items-center text-center'>
								<span className='text-h-lg-sm'>100%</span>
								<span className='text-txt-xs'>win rate</span>
							</div>
							<div className='flex flex-col items-end text-right'>
								<span className='flex uppercase text-green font-bold'>
									wwww
								</span>
								<span className='flex text-txt-xs'>recent result</span>
							</div>
						</div>
					</div>
					<div className='flex sc-overview-glass md:px-32 px-16 py-16 gap-32 h-[69px] items-center'>
						<FaFire className="text-red text-txt-3xl" />
						<div className='flex gap-40 justify-between grow'>
							<div className='flex flex-col items-start'>
								<span className='text-h-lg-sm'>0</span>
								<span className='text-txt-xs'>streak</span>
							</div>
							<div className='flex flex-col items-center'>
								<span className='text-h-lg-sm'>22</span>
								<span className='text-txt-xs'>Rank</span>
							</div>
							<div className='flex flex-col items-end'>
								<span className=''>36</span>
								<span className='flex text-txt-xs'>point</span>
							</div>
						</div>
					</div>
				</div>
			</div>
    );
}

export default ProfileOverview;