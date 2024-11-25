import { useNavigate } from "react-router-dom";


const FriendsChat = ({uid, friendInfo, displayTyping, ws}) => {

	const navigate = useNavigate();
	const handleReadMessage = () => {
		if (ws.current) {
			ws.current.send(JSON.stringify({'message': 'message is readedf', 'type': 'read', 'convId': friendInfo.conversationId}));
			// console.log('ws is send to read the message');
		}
		friendInfo.isRead = true;
		navigate(`/chat/${friendInfo.conversationId}`);
	};

	return (
		<div
			onClick={handleReadMessage}
			className={
				`text-white flex gap-16 p-8 rounded-[8px] hover:hover-secondary
				cursor-pointer ${friendInfo.conversationId === uid && 'hover-secondary'}`
			}
		>
			{friendInfo.isOnline &&
				<div className="relative">
					{!friendInfo.isRead && !friendInfo.sender && friendInfo.lastMessage	&& 
						<div className="absolute font-bold uppercase text-[10px] lg:hidden md:block hidden top-0 right-0 text-black bg-green rounded-lg py-2 px-4">new</div>
					}
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

					<div className="text-h-sm-xs font-semibold normal-case">
						{ !friendInfo.messageDate ? (`${friendInfo.firstName} ${friendInfo.lastName}`).length > 30
							? (`${friendInfo.firstName} ${friendInfo.lastName}`).substring(0, 30) + '...'
							: (`${friendInfo.firstName} ${friendInfo.lastName}`)
							: (`${friendInfo.firstName} ${friendInfo.lastName}`).length > 15
							? (`${friendInfo.firstName} ${friendInfo.lastName}`).substring(0, 15) + '...'
							: (`${friendInfo.firstName} ${friendInfo.lastName}`)
						}
					</div>

					{ displayTyping === 0 && !friendInfo.isRead && !friendInfo.sender &&
						<div className="text-txt-xs font-bold">
							{	friendInfo.lastMessage && friendInfo.lastMessage.length > 15
								? friendInfo.lastMessage.substring(0, 15) + "..."
								: friendInfo.lastMessage
							}
						</div>
					}

					{ displayTyping === 0 && friendInfo.isRead && friendInfo.lastMessage &&
						<div className={`text-txt-xs normal-case ${!friendInfo.lastMessage ? 'text-stroke-sc' : 'text-white'}`}>
							{	friendInfo.lastMessage && friendInfo.lastMessage.length > 15
								? friendInfo.lastMessage.substring(0, 15) + "..."
								: !friendInfo.lastMessage
								? 'Say Hello !'
								: friendInfo.lastMessage
							}
						</div>
					}

					{ displayTyping === 0 && !friendInfo.lastMessage &&
						<div className={`text-txt-xs normal-case text-stroke-sc`}>
							Say Hello !
						</div>
					}
					{ displayTyping !== 0 && <div className="text-txt-xs font-bold text-green">Typing...</div>}
				</div>
				
				<div className="flex flex-col justify-center items-end gap-8">
					<p className="text-txt-xs font-lighter text-stroke-sc">{friendInfo.messageDate}</p>
					<div className={`h-16 w-16 bg-transparent flex justify-center items-center rounded-full`}>
						{ !friendInfo.isRead && !friendInfo.sender && friendInfo.lastMessage	&& 
							<p className="text-txt-xs text-green font-bold">new</p>
						}
					</div> 
				</div>
			</div>
		</div>
	)
}

export default FriendsChat;