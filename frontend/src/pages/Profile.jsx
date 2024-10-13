import React, { useState } from 'react';
import Header from '../components/Header';
import ProfileOverview from '../components/ProfileOverview';
import ProfileStatistics from '../components/ProfileStatistics';
import ProfileAchievements from '../components/ProfileAchievements'
import ProfileFriends from '../components/ProfileFriends'
import { GiCrossedSwords } from "react-icons/gi";
import { FaClover } from "react-icons/fa6";
import { GiFlamedLeaf } from "react-icons/gi";
import { LiaMedalSolid } from "react-icons/lia";
import { MdGames } from "react-icons/md";
import { FaFire } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { div } from 'three/webgpu';

const profileMenu = ['overview', 'statistics', 'achievements', 'friends'];

const Profile = () => {
    const [selectedMenu, setSelectedMenu] = useState('friends');

    return (
        <div className="flex flex-col grow">
            <Header link='profile' />
            <div className="container">
                <div className="flex grow primary-glass p-16 gap-32 relative overflow-hidden">
                    <div className='absolute top-0 left-0 w-full h-[232px] overflow-hidden'>
                        <div className="w-full h-full absolute cover-gradient"></div>
                        <img 
                            className="object-cover w-full h-full object-center" 
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
                                <div className="flex items-center border rounded-lg border-stroke-sc p-8 gap-8">
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
                            <p className='text-txt-xs leading-16'>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
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

                        <div className='flex'>
                            {profileMenu.map(menu => (
                                <div 
                                    key={menu}
                                    className={`grow flex flex-col gap-8 items-center cursor-pointer`}
                                    onClick={() => setSelectedMenu(menu)}
                                >
                                    <span>{menu}</span>
                                    {selectedMenu === menu && <div className='bg-green h-[2px] w-full'></div>}
                                </div>
                            ))}
                        </div>

                        { selectedMenu === 'overview' && <ProfileOverview /> }
                        { selectedMenu === 'statistics' && <ProfileStatistics /> }
                        { selectedMenu === 'achievements' && <ProfileAchievements /> }
                        { selectedMenu === 'friends' && <ProfileFriends /> }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
