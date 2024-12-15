import { IoSearchOutline } from "react-icons/io5";
import { TiThMenu } from "react-icons/ti";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { useContext, useEffect, useRef, useState } from "react";
import UserContext from "../../context/UserContext";
import { BACKENDURL } from "../../utils/fetchWrapper";
import { useNavigate } from 'react-router-dom';

const Friends = ({ friend }) => {
	const navigate = useNavigate();
  return (
    <div
			onClick={() => navigate('/profile/overview/'+friend.username)}
			className="flex h-[72px] w-full gap-16 p-8 items-center justify-between secondary-glass-friends cursor-pointer"
		>
      <div className="flex gap-16">
				<div className="flex rounded-full w-[56px] h-[56px] border-[0.5px] border-stroke-sc overflow-hidden">
					<img
						src={
							friend.profile_image
							? `${BACKENDURL}${friend.profile_image}?t=${new Date().getTime()}`
							: "/images/default.jpeg"
						}
						alt="Friend Personal image"
						className="object-cover grow"
					/>
				</div>
        <div className="flex flex-col justify-center">
          <div className="text-txt-xs font-bold cursor-pointer">
            {`${friend.first_name} ${friend.last_name}`}
          </div>
          <div className="text-txt-xs text-gray">@{friend.username}</div>
        </div>
      </div>
      <div className="flex gap-16">
        <div className="flex items-center justify-center h-[24px] w-[55px] gap-10 px-12 py-4 border rounded-[4px] border-transparent bg-green text-black txt-xs font-medium cursor-pointer">
          invite
        </div>
        <div className="flex w-[24px] h-[24px] items-center justify-center cursor-pointer">
          <TiThMenu />
        </div>
      </div>
    </div>
  );
};

const FriendRequest = ({ friendRequest }) => {
	return (
		<div className="w-[150px] flex-shrink-0 border-[0.5px] border-stroke-sc flex flex-col rounded-md overflow-hidden">
			<div className="overflow-hidden grow flex border-b-[0.5px] border-stroke-sc">
				<img
					src={
						friendRequest.profile_image
						? `${BACKENDURL}${friendRequest.profile_image}?t=${new Date().getTime()}`
						: "/images/default.jpeg"
					}
					alt="request"
					className="object-cover grow"
				/>
			</div>
			<div className="text-txt-xs px-8 py-4 text-gray tracking-wide font-semibold">
				{friendRequest.first_name} {friendRequest.last_name}
			</div>
			<div className="p-8 grow flex gap-8 justify-center items-center">
				<button className="hover-secondary text-green p-8 transition-all rounded-md grow flex justify-center hover:bg-green hover:text-black">
					<IoMdCheckmark className="text-lg" />
				</button>
				<button className="hover-secondary text-red p-8 transition-all rounded-md flex justify-center hover:bg-red hover:text-white">
					<IoMdClose className="text-lg" />
				</button>
			</div>
		</div>
	)
}

const ProfileFriends = () => {
	const userContextData = useContext(UserContext);
	const scrollContainer = useRef(null);
	const [showLeftButton, setShowLeftButton] = useState(false);
	const [showRightButton, setShowRightButton] = useState(true);
  const friends = [];

	const scrollLeft = () => {
		if (scrollContainer.current) {
			scrollContainer.current.scrollBy({ left: -300, behavior: 'smooth' });
		}
	}
	const scrollRight = () => {
		if (scrollContainer.current) {
			scrollContainer.current.scrollBy({ left: 300, behavior: 'smooth' });
		}
	}
	const handleScroll = () => {
		if (scrollContainer.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
			setShowLeftButton(scrollLeft > 0);
			setShowRightButton(scrollLeft < scrollWidth - clientWidth);
		}
	}

	useEffect(() => {
		userContextData.getFriends();
		userContextData.setFriendRequest();
		const container = scrollContainer.current;
		if (container) {
			container.addEventListener('scroll', handleScroll);
			handleScroll();
			
			return () => container.removeEventListener('scroll', handleScroll);
		}
	}, []);

	if (userContextData.userFriends) {
		userContextData.userFriends.friends.map((item) => {
			friends.push(<Friends key={item.id} friend={{...item}} />);
		});
	}

	const friendRequest = [];
	if (userContextData.userFriendRequest) {
		userContextData.userFriendRequest.map((item) => {
			friendRequest.push(<FriendRequest key={item.id} friendRequest={{...item}} />);
		})
	}

  return (
    <>
      <div className="flex flex-col gap-32 h-full w-full no-scrollbar overflow-y-scroll">
				<div className="flex flex-col gap-8 relative">
					<h2 className="font-semibold tracking-wide ">friend requests</h2>
					{
						friendRequest.length
						? <div
								ref={scrollContainer}
								className="min-h-[240px] overflow-x-auto no-scrollbar w-full py-8 flex gap-16 scroll-smooth"
							>
								{friendRequest}
								{ showRightButton &&
									<button
										onClick={scrollRight}
										className="absolute top-1/2 right-0 p-10 flex arrow-glass transition-all text-white rounded-full hover:bg-black/50"
									>
										<FaChevronRight />
									</button>
								}
								{ showLeftButton && 
									<button
										onClick={scrollLeft}
										className="absolute top-1/2 left-0 p-10 flex arrow-glass transition-all text-white rounded-full hover:bg-black/50"
									>
										<FaChevronLeft />
									</button>
								}
							</div>
						: <p className="text-txt-sm flex justify-center text-stroke-sc">
								you have no friend request.
							</p>
					}

				</div>
				<div className="flex flex-col gap-8">
					<h2 className="font-semibold tracking-wide ">friends</h2>
					{friends.length
						? <div className="grid gap-16 sm:grid-cols-2 grid-cols-1 xl:grid-cols-3">
								{friends}
							</div>
						: <p className="text-txt-sm flex justify-center text-stroke-sc">
								you have no friend yet search for some you want
							</p>
						}
				</div>
      </div>
    </>
  );
};

export default ProfileFriends;
