import { IoSearchOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import FetchWrapper from '../../utils/fetchWrapper';

const URL = 'https://localhost:8000/';

const FetchData = new FetchWrapper(URL);

const getConversations = async (setData) => {
	try {
		const res = await FetchData.get('chat/conversations/');
		console.log(res);
		if (res.ok) {
			const data = await res.json();
			setData(data);
			console.log(data);
		} else if (res.status) {
			const data = await res.json();
			console.log(data);
		}
	} catch (error) {
		console.error(error);
	}
}

const FriendsChat = ({
	getFriendInfo,
	friendInfo,
	isTyping,
	isSend,
	isAcitve,
	messages}) => {

	const activeRef = useRef(null);
	useEffect(() => {
		if (activeRef.current) {
			if(isAcitve) {
				activeRef.current.classList.add('secondary-gradient')
			}
		}
	}, []);

	getFriendInfo(friendInfo);

	return (
		<Link to={'/chat/' + friendInfo.conversationId} className="text-white flex gap-16 p-8 rounded-[8px] hover:hover-secondary cursor-pointer" ref={activeRef}>
			{friendInfo.isOnline &&
				<div className="relative">
					<div className="w-56 h-56 rounded-full border-2 border-green overflow-hidden">
						<img src="/images/profile.png" alt="img" className="w-full"/>
					</div>
					<div className="absolute w-16 h-16 bg-green rounded-full right-0 bottom-0"></div>
				</div>
			}
			{!friendInfo.isOnline &&
				<div className="relative">
					<div className="w-56 h-56 rounded-full border-2 border-stroke-sc overflow-hidden">
						<img src="/images/profile.png" alt="img" className="w-full"/>
					</div>
					<div className="absolute w-16 h-16 bg-black border-[3px] border-stroke-sc rounded-full right-0 bottom-0"></div>
				</div>
			}

			<div className="grow lg:flex flex justify-between gap-16 md:hidden">
				<div className="flex flex-col justify-center gap-8">

					<div className="text-h-sm-xs">
						{ !friendInfo.messageDate ? (`${friendInfo.firstName} ${friendInfo.lastName}`).length > 30
							? (`${friendInfo.firstName} ${friendInfo.lastName}`).substring(0, 30) + '...'
							: (`${friendInfo.firstName} ${friendInfo.lastName}`)
							: (`${friendInfo.firstName} ${friendInfo.lastName}`).length > 15
							? (`${friendInfo.firstName} ${friendInfo.lastName}`).substring(0, 15) + '...'
							: (`${friendInfo.firstName} ${friendInfo.lastName}`)
						}
					</div>

					{!isTyping && isSend &&
						<div className="text-txt-xs font-bold">
							{	friendInfo.lastMessage && friendInfo.lastMessage.length > 10
								? friendInfo.lastMessage.substring(0, 10) + "..."
								: friendInfo.lastMessage
							}
						</div>
					}

					{ !isTyping && !isSend &&
						<div className={`text-txt-xs  ${!friendInfo.lastMessage ? 'text-stroke-sc' : 'text-white'}`}>
							{	friendInfo.lastMessage && friendInfo.lastMessage.length > 10
								? friendInfo.lastMessage.substring(0, 10) + "..."
								: !friendInfo.lastMessage
								? 'Say Hello !'
								: friendInfo.lastMessage
							}
						</div> }
					{ isTyping && <div className="text-txt-xs font-bold text-green">Typing...</div>}
				</div>
				<div className="flex flex-col justify-center items-end gap-8">
					<p className="text-txt-xs font-lighter">{friendInfo.messageDate}</p>
					{ isSend && <div className="h-16 w-16 bg-green flex justify-center items-center rounded-full">
						<p className="text-txt-xs text-black font-semibold">{messages}</p>
					</div> }
				</div>
			</div>
		</Link>
	)
}

const ChatFriends = ({uid, getFriendInfo}) => {

	const [friendsData, setFriendsData] = useState({});
	useEffect(() => {
		getConversations(setFriendsData);
	}, [])
	const chatFriends = [];
	if (friendsData && friendsData.users && friendsData.users.length) {
		friendsData.users.map(friend => {
			chatFriends.push(
				<FriendsChat
					getFriendInfo={getFriendInfo}
					friendInfo={friend}
					online={true}
					// isSend
					messages={3}
					key={friend.conversationId}
					// isTyping
				/>
			)
		})
	} else {
		chatFriends.push(<div className="text-stroke-sc text-center">no conversation friends</div>)
	}

	// for (let i = 0; i < 20; i++) {
	// 	if (i == 0 )
	// 		chatFriends.push(<FriendsChat online={true} isSend date='05/30/14' messages={3} key={i} isTyping />)
	// 	if (i < 3 && i !== 0)
	// 		chatFriends.push(<FriendsChat online={true} isSend date='05/30/14' messages={3} key={i}/>)
	// 	else if (i >= 3)
	// 		chatFriends.push(<FriendsChat date='05/30/14' messages={3} key={i}/>)
	// }

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