import { IoSearchOutline } from "react-icons/io5";
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
				console.log(activeRef.current);
			}
		}
	}, [])

	return (
		<div className="text-white flex gap-16 p-8 rounded-[8px]" ref={activeRef} key={props.key}>
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

			<div className="grow flex justify-between gap-16">
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
	return (
		<div className="container">
			<Header link='chat' />
			<div className="primary-glass p-16 flex gap-16 grow">
				<div className="w-[320px] lg:flex hidden flex-col gap-32">
					{/* search bar */}
					<div className="flex items-center relative lg:w-full md:w-[60%] w-[90%]">
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
				<div className="grow"></div>
				<div className="w-[0.5px] bg-stroke-sc lg:block hidden"></div>
				<div className="w-[320px] lg:block hidden"></div>
			</div>
		</div>
	)
}

export default Chat;