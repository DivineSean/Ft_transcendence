import { createContext, useContext, useEffect, useRef, useState } from "react";
import AuthContext from "./AuthContext";
import FetchWrapper from "../utils/fetchWrapper";
import useWebsocket from '../customHooks/useWebsocket'
import { useLocation } from 'react-router-dom';
import { getConversations } from '../utils/chatFetchData';

const NotifContext = createContext();



export default NotifContext;

export const NotifProvider = ({ children }) => {
	const FetchData = new FetchWrapper();
	const [friendRequest, setFriendRequest] = useState(false);
	const [notifData, setNotifData] = useState(null);

	const authContextData = useContext(AuthContext);
	const [isWsConnected, setIsWsConnected] = useState(false);
	const [updatedConversation, setUpdatedConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [tempMessages, setTempMessages] = useState([]);
	const [typing, setTyping] = useState("");
	const [displayTyping, setDisplayTyping] = useState(null);
	const [readedMessages, setReadedMessages] = useState(null);
	const location = useLocation();

	const wsHook = useWebsocket(`wss://${window.location.hostname}:8000/ws/chat/`, {
		onOpen: () => { setIsWsConnected(true); },
		onMessage: (e) => {
			const messageData = JSON.parse(e.data); // parse the event data

			if (messageData) {
				console.log('l3aazi messageData', messageData);
				if (messageData.type === "read") {
					// if we received the read event
					console.log('readed');
					setReadedMessages(messageData); // set readed message with the message we received from the socket to update all unreaded messages
				} else if (messageData.type === "typing")
					// if we received the typing event
					setDisplayTyping(messageData); // increment the display typing state to know that the uer is still typing
				else if (messageData.type === "stopTyping")
					// if we received the stop typing event
					setDisplayTyping(null); // reset display typing, to remove the typing message from the conversation
				else if (messageData.type === 'friendRequest') {
					console.log('hello al3ezi get notifs');
					getNotfications();
				} else if (messageData.type === 'createConv') {
					console.log('noooooootiiiif');
					if (location.pathname.search('chat') === -1)
						getNotfications();
				}
			}
		}
	});

	const getNotfications = async () => {
		try {
			const res = await FetchData.get("api/notification/");
			// console.log(res);
			if (res.ok) {
				const data = await res.json();
				setNotifData(data);
			}
		} catch (error) {
			// console.log('get notifs', error);
			authContextData.setGlobalMessage({
				message: error.message,
				isError: true,
			});
		}
	};

	const readNotification = async (notificationId) => {
		try {
			// console.log('notificationId', notificationId);
			const res = await FetchData.delete(`api/notification/${notificationId}/`);
			// console.log(res);
			if (res.ok) {
				const data = await res.json();
				getNotfications();
				// console.log(data);
			}
		} catch (error) {
			// console.log('error deletion notifications', error);
			authContextData.setGlobalMessage({
				message: error.message,
				isError: true,
			});
		}
	};

	const contextData = {
		updatedConversation,
		tempMessages,
		messages,
		typing,
		displayTyping,
		readedMessages,

		wsHook,
		notifData,
		isWsConnected,
		setIsWsConnected,
		setFriendRequest,
		getNotfications,
		setNotifData,
		readNotification,

		setMessages,
		setTempMessages,
		setTyping,
		setDisplayTyping,
		setReadedMessages,
		setUpdatedConversation,
	};

	return (
		<NotifContext.Provider value={contextData}>
			{children}
		</NotifContext.Provider>
	);
};
