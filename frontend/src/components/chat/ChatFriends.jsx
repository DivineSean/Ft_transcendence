import { useEffect } from "react";
import { Link } from "react-router-dom";


const FriendsChat = ({
	uid,
	friendInfo,
	isTyping,
	isSend,
	messages}) => {

	
	return (
		<Link
			to={'/chat/' + friendInfo.conversationId}
			className={
				`text-white flex gap-16 p-8 rounded-[8px] hover:hover-secondary
				cursor-pointer ${friendInfo.conversationId === uid && 'hover-secondary'}`
			}
		>
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

					<div className="text-h-sm-xs font-semibold">
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
							{	friendInfo.lastMessage && friendInfo.lastMessage.length > 15
								? friendInfo.lastMessage.substring(0, 15) + "..."
								: friendInfo.lastMessage
							}
						</div>
					}

					{ !isTyping && !isSend &&
						<div className={`text-txt-xs  ${!friendInfo.lastMessage ? 'text-stroke-sc' : 'text-white'}`}>
							{	friendInfo.lastMessage && friendInfo.lastMessage.length > 20
								? friendInfo.lastMessage.substring(0, 20) + "..."
								: !friendInfo.lastMessage
								? 'Say Hello !'
								: friendInfo.lastMessage
							}
						</div> }
					{ isTyping && <div className="text-txt-xs font-bold text-green">Typing...</div>}
				</div>
				<div className="flex flex-col justify-center items-end gap-8">
					<p className="text-txt-xs font-lighter text-stroke-sc">{friendInfo.messageDate}</p>
					<div className={`h-16 w-16 ${isSend ? 'bg-green' : 'bg-transparent'} flex justify-center items-center rounded-full`}>
						{ isSend && <p className="text-txt-xs text-black font-semibold">{messages}</p>}
					</div> 
				</div>
			</div>
		</Link>
	)
}

const ChatFriends = ({uid, friendsData, ws}) => {

	const friends = [];
	useEffect(() => {
		console.log('hello');
	}, [friendsData])
	if (friendsData && friendsData.users && friendsData.users.length) {
		friendsData.users.map(friend => {
			return (friends.push(
				<FriendsChat
					uid={uid}
					ws={ws}
					friendInfo={friend}
					messages={3}
					key={friend.conversationId}
				/>
			))
		})
	}
	else {
		friends.push(<div key={0} className="text-stroke-sc text-center">no conversation friends</div>)
	}

	return (
		<div className="h-14 flex grow flex-col gap-8 overflow-y-scroll no-scrollbar">
			{friends}
		</div>
	)
}

export default ChatFriends;