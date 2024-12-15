import { IoSearchOutline } from "react-icons/io5";
import { TiThMenu } from "react-icons/ti";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { useRef, useState } from "react";




const Friends = () => {
  return (
    <div className="flex h-[72px] w-full gap-16 p-8 items-center justify-between  secondary-glass-friends">
      <div className="flex gap-16">
        <img
          src="/images/profile.png"
          alt="Friend Personal image"
          className="flex rounded-full w-[56px] h-[56px] border-[0.5px] border-stroke-sc"
        />
        <div className="flex flex-col justify-center">
          <div className="text-txt-xs font-bold cursor-pointer">
            savannah nguyen
          </div>
          <div className="text-txt-xs text-gray">@snguyen</div>
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

const ProfileFriends = () => {
	const scrollContainer = useRef(null);
	const [showLeftButton, setShowLeftButton] = useState(false);
	const [showRightButton, setShowRightButton] = useState(true);
  const friends = [];
  for (let i = 0; i < 400; i++) {
    friends.push(<Friends key={i} />);
  }
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
			// const { scrollLeft, scrollWdith}
		}
	}
  return (
    <>
      {/* <div className="flex w-full gap-10 justify-end overflow-x-scroll"> */}
        {/* <div className="flex items-center relative w-full md:w-[320px]">
          <input
            type="text"
            placeholder="Find users"
            className="send-glass text-txt-xs px-32 py-8 outline-none text-white w-full"
          />
          <IoSearchOutline className="text-gray absolute left-8 text-txt-md" />
        </div> */}
      {/* </div> */}
      <div className="flex flex-col gap-32 h-full w-full no-scrollbar overflow-y-scroll">
				<div className="flex flex-col gap-8 relative">
					<h2 className="font-semibold tracking-wide ">friend requests</h2>
					<div
						ref={scrollContainer}
						className="min-h-[240px] overflow-x-auto no-scrollbar w-full py-8 flex gap-16 scroll-smooth"
					>
						{[...Array(100)].map((_, index) => (
							<div
								key={index}
								className="w-[150px] flex-shrink-0 border-[0.5px] border-stroke-sc flex flex-col rounded-md overflow-hidden"
							>
								<div className="overflow-hidden grow flex border-b-[0.5px] border-stroke-sc">
									<img src="/images/default.jpeg" alt="request" className="object-cover grow" />
								</div>
								<div className="text-txt-xs px-8 py-4 text-gray tracking-wide font-semibold">
									span hello
								</div>
								<div className="p-8 grow flex gap-16 justify-center items-center">
									<button className="hover-secondary text-green p-8 transition-all rounded-md grow flex justify-center hover:bg-green hover:text-black">
										<IoMdCheckmark className="text-lg" />
									</button>
									<button className="hover-secondary text-red p-8 transition-all rounded-md flex justify-center hover:bg-red hover:text-white">
										<IoMdClose className="text-lg" />
									</button>
								</div>
							</div>
						))}
						<button
							onClick={scrollRight}
							className="absolute top-1/2 right-0 p-10 flex arrow-glass transition-all text-white rounded-full hover:bg-black/50"
						>
							<FaChevronRight />
						</button>
						<button
							onClick={scrollLeft}
							className="absolute top-1/2 left-0 p-10 flex arrow-glass transition-all text-white rounded-full hover:bg-black/50"
						>
							<FaChevronLeft />
						</button>
					</div>
				</div>
				<div className="flex flex-col gap-8">
					<h2 className="font-semibold tracking-wide ">friends</h2>
					<div className="grid gap-16 sm:grid-cols-2 grid-cols-1 xl:grid-cols-3">
						{friends}
					</div>
				</div>
      </div>
    </>
  );
};

export default ProfileFriends;
