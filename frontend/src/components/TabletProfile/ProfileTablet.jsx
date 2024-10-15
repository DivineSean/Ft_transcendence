import Header from '../Header';
import ProfileOverview from '../DesktopProfile/ProfileOverview';
import ProfileStatistics from '../DesktopProfile/ProfileStatistics';
import ProfileAchievements from '../DesktopProfile/ProfileAchievements'
import ProfileFriends from '../DesktopProfile/ProfileFriends'
import React, { useState } from 'react';

const profileMenu = ['overview', 'statistics', 'achievements', 'friends'];

const ProfileTablet = () => {
    const [selectedMenu, setSelectedMenu] = useState('overview');
    return (
        <div className="flex flex-col grow">
            <Header link='profile' />
                <div className="container">
                    <div className="flex grow primary-glass p-16 gap-16 relative overflow-hidden">
                        <div className='absolute top-0 left-0 w-full h-[232px] overflow-hidden'>
                        <div className="w-full h-full absolute cover-gradient"></div>
                            <img
                                className="object-cover w-full h-full object-center" 
                                src="images/profile-cover.webp" 
                                alt="Profile Cover image" 
                                />
                        </div>
                        <div className="absolute flex flex-col gap-32 p-16">
                            <div className="flex flex-col gap-32">
                                <div className="flex flex-col gap-8 py-16 h-[181px] w-[156px] items-center">
                                    <img 
                                        className="border-4 border-green w-[96px] h-[96px] rounded-full"
                                        src="images/profile.png" 
                                        alt="Profile image" 
                                    />
                                    <h1 className="text-h-sm-sm font-bold">simhammed stoune</h1>
                                    <h2 className="text-txt-xs">@sistoune</h2>
                                </div>
                            </div>
                            <div className="flex gap-16">
                                <div>
                                    <img 
                                        src="images/bmo.png" 
                                        alt="Player Character" 
                                    />
                                </div>
                                <div className='flex flex-col gap-8'>
                                    <h1 className='text-h-lg-md font-bold'>about</h1> 
                                    <p className='text-txt-xs leading-16'>
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                    </p>
                                </div>
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
export default ProfileTablet;