import Header from '../components/Header';
import { GiCrossedSwords } from "react-icons/gi";
import { FaClover } from "react-icons/fa6";
import { GiFlamedLeaf } from "react-icons/gi";
import { LiaMedalSolid } from "react-icons/lia";
import { MdGames } from "react-icons/md";
import { FaW } from "react-icons/fa6";
import { FaL } from "react-icons/fa6";
import { FaFire } from "react-icons/fa6";

const Profile = () => {
    return (
			<div className="flex flex-col grow">
				<Header link='profile' />
        <div className="container">
            <div className="flex grow primary-glass p-16 gap-32 relative overflow-hidden">
                <div className='absolute top-0 left-0 w-full h-[232px] overflow-hidden'>
                    <div className="w-full h-full absolute cover-gradient h-full"></div>
                    <img 
                        className="object-cover w-full h-full object-center h-full" 
                        src="images/profile-cover.webp" 
                        alt="Profile Cover image" 
                    />
                </div>
                <div className="flex flex-col secondary-glass p-16 gap-16 w-[320px] overflow-hidden">
                    <div className="flex flex-col gap-8 items-center">
                        <img
                            className="border-4 border-green w-[120px] h-[120px] rounded-full"
                            src="images/profile.png" 
                            alt="Profile image" 
                        />
                        <h1 className="text-h-lg-md font-bold">simhammed stoune</h1>
                        <h2 className="text-txt-md">@sistoune</h2>
                        
                    </div>
                    <div className="flex flex-col gap-16 text-gray">
                        <div className="flex justify-center gap-16">
                            <div className="flex items-center  border rounded-lg border-stroke-sc p-8 gap-8">
                                <GiCrossedSwords className="text-green text-txt-2xl"/>
                                <p>34</p>
                            </div>
                            <div className="flex items-center border rounded-lg border-stroke-sc p-8 gap-8">
                                <FaClover className="text-green text-txt-2xl"/>
                                <p>72</p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-16">
                            <div className="flex items-center border rounded-lg border-stroke-sc p-8 gap-8">
                                <GiFlamedLeaf className="text-green text-txt-2xl"/>
                                <p>16</p>
                            </div>
                            <div className="flex items-center border rounded-lg border-stroke-sc p-8 gap-8">
                                <LiaMedalSolid className="text-green text-txt-2xl"/>
                                <p>442</p>
                            </div>
                        </div>
                    </div>
                    <div className='bg-stroke-sc h-[1px] w-full'></div>
                    <div className='flex flex-col gap-8'>
                       <h1 className='text-h-lg-md font-bold'>about</h1> 
                       <p className='text-txt-xs leading-16'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    </div>
                    <div className='bg-stroke-sc h-[1px] w-full'></div>
                    <div>
                        <img 
                        className='w-[241px] h-[288px]'
                        src="images/bmo.png" 
                        alt="Player Character" 
                        />
                    </div>
                </div>
                <div className="flex flex-col grow z-[1] gap-16">
                    <div className='w-full h-[216px]'></div>
                    {/* Pannel */}
                    <div className='flex'>
                        <div className='grow flex flex-col gap-8 items-center cursor-pointer'>
                            <span>overview</span>
                            <div className='bg-green h-[2px] w-full'></div>
                        </div>
                        <div className='grow flex flex-col gap-8 items-center cursor-pointer'>
                            <span>overview</span>
                            {/* <div className='bg-green h-[2px] w-full'></div> */}
                        </div>
                        <div className='grow flex flex-col gap-8 items-center cursor-pointer'>
                            <span>overview</span>
                            {/* <div className='bg-green h-[2px] w-full'></div> */}
                        </div>
                        <div className='grow flex flex-col gap-8 items-center cursor-pointer'>
                            <span>overview</span>
                            {/* <div className='bg-green h-[2px] w-full'></div> */}
                        </div>
                    </div>
                    {/* Pannel */}
                    <div className='flex gap-32'>
                        <div className='flex flex-col h-[288px] rounded-[8px] border-[0.5px] border-stroke-sc overflow-hidden'>
                            <div className='p-32 relative h-[150px] overflow-hidden flex items-end'>
                                <img 
                                    className='absolute top-0 left-0 w-full'
                                    src="images/pong-overview.webp" 
                                    alt=""
                                />
                                <div className='absolute top-0 left-0 w-full h-full overflow-hidden cover-gradient'></div>
                                <h2 className='absolute font-bold text-h-lg-lg'>ping pong</h2>
                            </div>
                            <div className='flex p-32 py-16 gap-32 h-[69px] items-center'>
                                <MdGames className="text-green text-txt-3xl" />
                                <div className='flex gap-40 justify-between grow'>
                                    <div className='flex flex-col'>
                                        <span className='text-h-lg-sm'>12</span>
                                        <span className='text-txt-xs'>total played</span>
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-h-lg-sm'>100%</span>
                                        <span className='text-txt-xs'>win rate</span>
                                    </div>
                                    <div className=''>
                                        <span className='flex uppercase text-green font-bold'>
                                            wwww
                                        </span>
                                        <span className='flex text-txt-xs'>recent result</span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex sc-overview-glass p-32 py-16 gap-32 h-[69px] items-center'>
                                <FaFire className="text-red text-txt-3xl" />
                                <div className='flex gap-40 justify-between grow'>
                                    <div className='flex flex-col'>
                                        <span className='text-h-lg-sm'>0</span>
                                        <span className='text-txt-xs'>streak</span>
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-h-lg-sm'>22</span>
                                        <span className='text-txt-xs'>Rank</span>
                                    </div>
                                    <div className=''>
                                        <span className=''>
                                            36
                                        </span>
                                        <span className='flex text-txt-xs'>point</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
			</div>
    );
}

export default Profile;
