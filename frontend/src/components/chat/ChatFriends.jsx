import { IoSearchOutline } from "react-icons/io5";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

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
		<Link to='/chat/1' className="text-white flex gap-16 p-8 rounded-[8px] hover:hover-secondary cursor-pointer" ref={activeRef}>
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

			<div className="grow lg:flex flex justify-between gap-16 md:hidden">
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
		</Link>
	)
}

const ChatFriends = ({uid}) => {

	const chatFriends = [];
	for (let i = 0; i < 20; i++) {
		if (i == 0 )
			chatFriends.push(<FriendsChat online={true} isSend date='05/30/14' messages={3} key={i} isTyping />)
		if (i < 3 && i !== 0)
			chatFriends.push(<FriendsChat online={true} isSend date='05/30/14' messages={3} key={i}/>)
		else if (i >= 3)
			chatFriends.push(<FriendsChat date='05/30/14' messages={3} key={i}/>)
	}

	return (
		<div 
			className={`
				lg:w-[320px] md:w-[72px] w-full flex-col gap-32
				${uid ? 'md:flex hidden' : 'flex'}
			`}
		>
			<div className="lg:flex hidden items-center relative w-full">
				<input type="text" placeholder='find users' className='search-glass text-txt-xs px-32 py-8 outline-none text-white w-full'/>
				<IoSearchOutline className='text-gray absolute left-8 text-txt-md' />
			</div>

			<div className="h-14 flex grow flex-col gap-8 overflow-y-scroll no-scrollbar">
				{chatFriends}
			</div>
		</div>
	)
}

export default ChatFriends;