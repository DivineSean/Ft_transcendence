import ProfileOptions from "../components/chat/ProfileOptions";
import Conversation from "../components/chat/Conversation";
import FriendsChat from "../components/chat/FriendsChat";
import { useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { getConversations } from "../utils/chatFetchData";
import AuthContext from "../context/AuthContext";

const Chat = () => {
	const { setGlobalMessage } = useContext(AuthContext);
	const { uid } = useParams();
	const [profileSide, setProfileSide] = useState(window.innerWidth <= 768 ? false : true);
	const [conversationSide, setConversationSide] = useState(true);
	const navigate = useNavigate();

	const ws = useRef(null);
	useEffect(() => {
		ws.current = new WebSocket(`wss://${window.location.hostname}:8000/ws/chat/${uid}/`);
		// console.log('ws: ', ws.current);

		return () => {
			if (ws.current) {
				ws.current.close();
				ws.current = null;
			}
		}
		
	}, [])


	const [friendsData, setFriendsData] = useState(null);
	useEffect(() => {
		getConversations(setFriendsData, setGlobalMessage, navigate);
	}, [])
	let friendInfo = null;

	const chatFriends = [];
	if (friendsData && friendsData.users && friendsData.users.length) {
		friendInfo = friendsData.users.filter(u => u.conversationId === uid)[0];
		friendsData.users.map(friend => (
			chatFriends.push(
				<FriendsChat
					uid={uid}
					friendInfo={friend}
					// isSend
					messages={3}
					// key={friend.username}
					// key={friend.conversationId}
					// isTyping
				/>
			)
		))
	} else {
		chatFriends.push(<div className="text-stroke-sc text-center">no conversation friends</div>)
	}


	window.addEventListener('resize', () => {
		if (!conversationSide)
			setConversationSide(true);
		if (window.innerWidth < 768)
			setProfileSide(false);
		if (window.innerWidth >= 768)
			setProfileSide(true);
	})

	return (
		<div className="flex flex-col grow">
			<Header link='chat' />
			<div className="container md:px-16 px-0">
				<div className="backdrop-blur-sm w-full h-full absolute top-0 right-0"></div>
				<div className="primary-glass p-16 flex gap-16 grow">

					<div className={`lg:w-[320px] md:w-[72px] w-full flex-col gap-32 ${uid ? 'md:flex hidden' : 'flex'}`}>
						<div className="lg:flex hidden items-center relative w-full">
							<input type="text" placeholder='find users' className='search-glass text-txt-xs px-32 py-8 outline-none text-white w-full'/>
							<IoSearchOutline className='text-gray absolute left-8 text-txt-md' />
						</div>
						<div className="h-14 flex grow flex-col gap-8 overflow-y-scroll no-scrollbar">
							{chatFriends}
						</div>
					</div>

					<div className="w-[0.5px] bg-stroke-sc md:block hidden"></div>

					{uid && friendInfo &&
						<>
							{conversationSide &&
								<Conversation
									uid={uid}
									ws={ws}
									friendInfo={friendInfo}
									displayProfile={setProfileSide}
									hideSelf={setConversationSide}
								/>
							}
							<div className="w-[0.5px] bg-stroke-sc md:block hidden"></div>
							{profileSide &&
								<ProfileOptions
									uid={uid}
									friendInfo={friendInfo}
									displayCoversation={setConversationSide}
									hideSelf={setProfileSide}
									isVisible={profileSide}
								/>
							}
						</>
					}

					{(!uid || !friendInfo) && 
						<div className="grow md:flex hidden flex-col gap-16 justify-center items-center text-gray">
							<div className="contrast-75 grayscale-[50%] w-[300px] h-[300px] bg-[url('/images/chat.png')] bg-cover bg-center"></div>
							<p className="w-[300px] font-light tracking-wider text-center text-txt-sm">Send and receive messanges with your friends freely and securely.</p>
						</div>
					}
				</div>
			</div>
		</div>
	)
}

export default Chat;