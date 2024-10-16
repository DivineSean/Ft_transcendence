import { IoSearchSharp, IoSearchOutline } from "react-icons/io5";
import { TiThMenu } from "react-icons/ti";

const Friends = () => {
    return (
        <div className="flex h-[72px] w-full gap-16 p-8 items-center justify-between  secondary-glass-friends">
            <div className="flex gap-16">
                <img 
                    src="images/profile.png" 
                    alt="Friend Personal image"
                    className="flex rounded-full w-[56px] h-[56px]"
                />
                <div className="flex flex-col justify-center">
                    <div className="text-txt-xs font-bold cursor-pointer">savannah nguyen</div>
                    <div className="text-txt-xs text-gray">@snguyen</div>
                </div>
            </div>
            <div className="flex gap-16">
                <div className="flex items-center justify-center h-[24px] w-[55px] gap-10 px-12 py-4 border rounded-[4px] border-transparent bg-green text-black txt-xs font-medium cursor-pointer">invite</div>
                <div className="flex w-[24px] h-[24px] items-center justify-center cursor-pointer">
                    <TiThMenu />
                </div>
            </div>
        </div>
    )
}

const ProfileFriends = () => {

    const friends = []
    for (let i = 0; i < 400; i++) {
        friends.push(<Friends key={i} />)
    }
    return (
        <>
            <div className="flex w-full h-[32px] gap-10 justify-end">
                <div className="flex items-center relative w-full md:w-[320px]">
                    <input type="text" placeholder='Find users' className='send-glass text-txt-xs px-32 py-8 outline-none text-white w-full'/>
                    <IoSearchOutline className='text-gray absolute left-8 text-txt-md' />
                </div>
            </div>
            <div className='flex flex-col gap-16 h-full no-scrollbar overflow-y-scroll'>
                <div className="grid gap-16 sm:grid-cols-2 grid-cols-1 xl:grid-cols-3">
                    {friends}
                </div>
            </div>
        </>
    );
}

export default ProfileFriends;
