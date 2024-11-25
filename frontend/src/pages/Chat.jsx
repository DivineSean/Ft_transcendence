import ProfileOptions from "../components/chat/ProfileOptions";
import Conversation from "../components/chat/Conversation";
import { useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { getConversations } from "../utils/chatFetchData";
import AuthContext from "../context/AuthContext";
import ChatFriends from "../components/chat/ChatFriends";


const Chat = () => {
	const { uid } = useParams();
	const navigate = useNavigate();
	const { setGlobalMessage } = useContext(AuthContext);

	// states
	const [typing, setTyping] = useState('');
	const [messages, setMessages] = useState([]);
	const [tempMessages, setTempMessages] = useState([]);
	const [friendsData, setFriendsData] = useState(null);
	const [displayTyping, setDisplayTyping] = useState(0);
	const [isWsConnected, setIsWsConnected] = useState(false);
	const [readedMessages, setReadedMessages] = useState(null);
	const [conversationSide, setConversationSide] = useState(true);
	const [updatedConversation, setUpdatedConversation] = useState(null);
	const [profileSide, setProfileSide] = useState(window.innerWidth <= 768 ? false : true);

	const ws = useRef(null);
	useEffect(() => {
		ws.current = new WebSocket(`wss://${window.location.hostname}:8000/ws/chat/`);
		// console.log('from chat ws');
		// console.log('ws: ', ws.current);

		ws.current.onopen = () => { // overide the onopen event
			console.log('Connected')
			// here we set this state to true to make sure
			// that the socket is connected successfully when we want to send an event
			setIsWsConnected(true);
		}

		ws.current.onclose = () => console.log('Disconnected') // override the onclose event
		
		return () => {
			if (ws.current) {
				ws.current.close();
				ws.current = null;
			}
		}
		
	}, [])

	// check if there is a new message and add it to the message array state
	useEffect(() => {
		if (ws.current) {
			ws.current.onmessage = (e) => {
				const messageData = JSON.parse(e.data); // parse the event data

				if (messageData) { // check if the event data is not empty then do the whole work
					if (messageData.type === 'message') { // if we received the message event
						setUpdatedConversation(messageData); // set the updated data for the left side (friend chat)

						if (uid && messageData.convId === uid) { // check if the user is entered to the conversation that received the message

							if (!messageData.isSender) // check if the user is the receiver then send to the sender that the message is readed
								ws.current.send(JSON.stringify({'message': 'message is readedf', 'type': 'read', 'convId': uid}));
							
							setMessages((preveMessage) => [...preveMessage, messageData]); // append the new message to the previous ones to display them
							
							setTempMessages([]); // reset the temp message that we dsiplay them to the user before the socket receive the events
							
							setTyping(''); // reset is typing to notif the receiver that the user no longer is typing
							
							setDisplayTyping(0); // reset the display typing to make the front don't display is typing message to the user
						}
					} else if (messageData.type === 'read') { // if we received the read event
						setReadedMessages(messageData); // set readed message with the message we received from the socket to update all unreaded messages
						console.log('is reaaad');
					}

					else if (messageData.type === 'typing') // if we received the typing event
						setDisplayTyping(prev => prev + 1); // increment the display typing state to know that the uer is still typing

					else if (messageData.type === 'stopTyping') // if we received the stop typing event
						setDisplayTyping(0); // reset display typing, to remove the typing message from the conversation
				}
			}
		}
	}, [ws.current, uid]);
	
	useEffect(() => { // first time fetch conversation message from the database to render them to the user
		getConversations(setFriendsData, setGlobalMessage, navigate);
	}, []);

	useEffect(() => { // if the updatedConversation is updated thats mean we need to update chat friend component
		if (updatedConversation) {

			// find the conversation that we are already entered into it
			const findConv = (friendsData.users.filter(user => user.conversationId === updatedConversation.convId)[0]);

			// then update the values inside that conversation
			if (findConv) {
				findConv.lastMessage = updatedConversation.message;
				findConv.messageDate = updatedConversation.timestamp;
			}
			
			// get all other conversation 
			const newFriendsData = friendsData.users.filter(user => user.conversationId !== updatedConversation.convId);

			// then resort them to make the updated conversation the first one
			setFriendsData({
				...friendsData,
				users: [findConv, ...newFriendsData]
			});
			
		}
	}, [updatedConversation]);
	
	let friendInfo = []; // get the conversation that have the same uid that we have in the url
	if (friendsData && friendsData.users && friendsData.users.length) {
		friendInfo = friendsData.users.filter(u => u.conversationId === uid)[0];
	}

	// this event listener just for the small media if the window is resized the profileOption component will disappear 
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
						<ChatFriends
							friendsData={friendsData}
							displayTyping={displayTyping}
							uid={uid}
							ws={ws}
						/>
					</div>

					<div className="w-[0.5px] bg-stroke-sc md:block hidden"></div>

					{uid && friendInfo &&
						<>
							{conversationSide &&
								<Conversation
									uid={uid}
									ws={ws}
									typing={typing}
									isWsConnected={isWsConnected}
									setTyping={setTyping}
									displayTyping={displayTyping}
									setTempMessages={setTempMessages}
									tempMessages={tempMessages}
									setReadedMessages={setReadedMessages}
									readedMessages={readedMessages}
									setMessages={setMessages}
									messages={messages}
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