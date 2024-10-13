import { IoSearchOutline, IoShieldOutline, IoGameControllerOutline } from "react-icons/io5";
import { BiSolidSend } from "react-icons/bi";
import { TbDiamond, TbPingPong } from "react-icons/tb";
import Header from "../components/Header";
import { useEffect, useRef } from "react";

// image
// online or offline
// sent a message or not 
// date 
// active or not 

const FriendsChat = ({...props}) => {

	const activeRef = useRef(null);
	useEffect(() => {
		if (activeRef.current) {
			if(props.isAcitve) {
				activeRef.current.classList.add('secondary-gradient')
			}
		}
	}, [])

	return (
		<div className="text-white flex gap-16 p-8 rounded-[8px] hover:secondary-glass cursor-pointer" ref={activeRef} key={props.key}>
			{
				props.online &&
				<div className="relative">
					<div className="w-56 h-56 rounded-full border-2 border-green overflow-hidden">
						<img src="/images/profile.png" alt="img" className="w-full"/>
					</div>
					<div className="absolute w-16 h-16 bg-green rounded-full right-0 bottom-0"></div>
				</div>
			}
			{
				!props.online &&
				<div className="relative">
					<div className="w-56 h-56 rounded-full border-2 border-gray overflow-hidden">
						<img src="/images/profile.png" alt="img" className="w-full"/>
					</div>
					<div className="absolute w-16 h-16 bg-black border-[3px] border-gray rounded-full right-0 bottom-0"></div>
				</div>
			}

			<div className="grow lg:flex justify-between gap-16 hidden">
				<div className="flex flex-col justify-center gap-8">
					<div className="text-h-sm-xs">Kathryn Murphy</div>
					{ !props.isTyping && props.isSend && <div className="text-txt-xs font-bold">hello sahbi l3azii</div> }
					{ !props.isTyping && !props.isSend && <div className="text-txt-xs">hello sahbi l3azii</div> }
					{ props.isTyping && <div className="text-txt-xs font-bold text-green">Typing...</div>}
				</div>
				<div className="flex flex-col justify-center items-end gap-8">
					<p className="text-txt-xs font-lighter">{props.date}</p>
					{ props.isSend && <div className="h-16 w-16 bg-green flex justify-center items-center rounded-full">
						<p className="text-txt-xs text-black font-semibold">{props.messages}</p>
					</div> }
				</div>
			</div>
		</div>
	)
}

const Message = ({...props}) => {
	if (props.side === 'right') {
		return (
			<div className="flex gap-16 items-end">
				<div className="grow"></div>
				<div className="message-glass p-8 rounded-[8px] rounded-br-[2px] max-w-[403px] text-gray text-sm">
					{props.message}
				</div>
				<div className="min-w-24 min-h-24 max-w-24 object-cover max-h-24 overflow-hidden flex rounded-full">
					<img src="images/profile.png" alt="p" />
				</div>
			</div>
		)

	} else {
		
		return (
			<div className="flex gap-16 items-end">
				<div className="min-w-24 min-h-24 max-w-24 object-cover max-h-24 overflow-hidden flex rounded-full">
					<img src="images/profile.png" alt="p" />
				</div>
				<div className="message-glass p-8 rounded-[8px] rounded-bl-[2px] max-w-[403px] text-gray text-sm">
					{props.message}
				</div>
			</div>
		)

	}
}

const Chat = () => {
	const chatFriends = [];
	for (let i = 0; i < 20; i++) {
		if (i == 0 )
			chatFriends.push(<FriendsChat online={true} isSend date='05/30/14' messages={3} key={i} isTyping />)
		if (i < 3)
			chatFriends.push(<FriendsChat online={true} isSend date='05/30/14' messages={3} key={i}/>)
		else
			chatFriends.push(<FriendsChat date='05/30/14' messages={3} key={i}/>)
	}

	const conversation = [];
	for (let i = 0; i < 40; i++) {
		if (i % 2) {
			conversation.push(<Message side='left' message='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' key={i} />)
		} else 
			conversation.push(<Message side='right' message='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' key={i} />)
	}

	return (
		<div className="flex flex-col grow">
		<Header link='chat' />
		<div className="container">
			<div className="backdrop-blur-sm w-full h-full absolute top-0 right-0"></div>
			<div className="primary-glass p-16 flex gap-16 grow">
				<div className="lg:w-[320px] md:flex hidden flex-col gap-32">
					{/* search bar */}
					<div className="lg:flex hidden items-center relative w-full">
						<input type="text" placeholder='find users' className='search-glass text-txt-xs px-32 py-8 outline-none text-white w-full'/>
						<IoSearchOutline className='text-gray absolute left-8 text-txt-md' />
					</div>

					<div className="h-14 flex grow flex-col gap-8 overflow-y-scroll no-scrollbar">
						{/* <FriendsChat online={true} isSend date='05/30/14' messages={3}/>
						<FriendsChat online={false} isTyping isAcitve/> */}
						{chatFriends}
					</div>
				</div>
				<div className="w-[0.5px] bg-stroke-sc md:block hidden"></div>
				<div className="grow flex flex-col gap-32">
					<div className="border-b-[0.5px] border-stroke-sc pb-16 flex gap-16">
						<div className={`w-56 h-56 rounded-full border overflow-hidden border-green`}>
							<img src="images/profile.png" alt="profile" />
						</div>
						<div className="flex flex-col justify-between">
							<h2 className="text-h-sm-md font-bold">devon lane</h2>
							<p className="text-green">online</p>
						</div>
					</div>
					<div className="h-14 flex grow flex-col-reverse gap-16 overflow-y-scroll no-scrollbar">
						{conversation}
					</div>
					<div className="flex items-center relative">
						<input type="text" placeholder='Aa...' className='send-glass text-txt-md px-16 pr-56 py-12 outline-none text-white w-full grow'/>
						<BiSolidSend className='text-gray absolute right-16 text-txt-3xl cursor-pointer hover:text-green' />
					</div>
				</div>
				<div className="w-[0.5px] bg-stroke-sc lg:block hidden"></div>
				<div className="w-[300px] lg:flex flex-col gap-32 hidden">
					<div className="flex flex-col gap-8 items-center">
						<div className="w-[104px] h-[104px] object-cover flex rounded-full overflow-hidden">
							<img src="images/profile.png" alt="p" />
						</div>
						<h2 className="text-h-lg-md font-bold">devon Lane</h2>
						<p className="text-txt-md">@delane</p>
						<button className="bg-green text-black rounded px-12 py-4">invite to play</button>
					</div>
					<div className="flex flex-col gap-16 items-center">
						<div className="flex gap-16">
							<div className="p-8 flex gap-8 border border-stroke-sc rounded-[8px]">
								<TbDiamond className="text-green text-txt-2xl"/>
								<p className="text-txt-md text-gray">14.35</p>
							</div>
							<div className="p-8 flex gap-8 border border-stroke-sc rounded-[8px]">
								<TbPingPong className="text-green text-txt-2xl"/>
								<p className="text-txt-md text-gray">5</p>
							</div>
						</div>
						<div className="flex gap-16">
							<div className="p-8 flex gap-8 border border-stroke-sc rounded-[8px]">
								<IoShieldOutline className="text-green text-txt-2xl"/>
								<p className="text-txt-md text-gray">10</p>
							</div>
							<div className="p-8 flex gap-8 border border-stroke-sc rounded-[8px]">
								<IoGameControllerOutline className="text-green text-txt-2xl"/>
								<p className="text-txt-md text-gray">14.03</p>
							</div>
						</div>
					</div>
					<div className="h-[0.5px] bg-stroke-sc w-full"></div>
					<div className="flex flex-col gap-8">
						<h2 className="text-h-lg-sm">about</h2>
						<p className="text-txt-xs text-gray">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
						</p>
					</div>
					{/* <div className="h-[0.5px] bg-stroke-sc w-full"></div> */}
				</div>
			</div>
		</div>
		</div>
	)
}

export default Chat;