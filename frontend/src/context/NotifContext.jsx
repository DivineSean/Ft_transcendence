import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import FetchWrapper from "../utils/fetchWrapper";

const NotifContext = createContext();

export default NotifContext;

export const NotifProvider = ({ children }) => {
	const FetchData = new FetchWrapper();
	const navigate = useNavigate();
	const ws = useRef(null);
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
	const [uid, setUid] = useState(null);




	useEffect(() => {
		ws.current = new WebSocket(
		`wss://${window.location.hostname}:8000/ws/chat/`,
		);
		// console.log('from chat ws');
		// console.log('ws: ', ws.current);

		ws.current.onopen = () => {
		// overide the onopen event
		console.log("Connected");
		// here we set this state to true to make sure
		// that the socket is connected successfully when we want to send an event
		setIsWsConnected(true);
		};

		ws.current.onclose = () => console.log("Disconnected"); // override the onclose event

		return () => {
		if (ws.current) {
			ws.current.close();
			ws.current = null;
		}
		};
	}, []);

	// if (ws.current) {
	// 	ws.current.onmessage = (e) => {
	// 		const socketData = JSON.parse(e.data);
	// 		if (socketData) {
	// 			if (socketData.type === 'friendRequest')
	// 				getNotfications();
	// 			console.log('chihaja tbedlat', socketData);
	// 			console.log('type', socketData.type);
	// 			console.log('message', socketData.message);
	// 		}
	// 	}
	// }

	if (ws.current) {
		console.log('ach had l9wada');
			ws.current.onmessage = (e) => {
			const messageData = JSON.parse(e.data); // parse the event data

			if (messageData) {
				// check if the event data is not empty then do the whole work
				if (messageData.type === "message") {
					// if we received the message event
					setUpdatedConversation(messageData); // set the updated data for the left side (friend chat)
					// console.log(messageData);

				if (uid && messageData.convId === uid) {
					// check if the user is entered to the conversation that received the message

					if (!messageData.isSender) {
						// check if the user is the receiver then send to the sender that the message is readed
						ws.current.send(
							JSON.stringify({
							message: "message is readed",
							type: "read",
							convId: uid,
							}),
						);
						console.log('dkhel lhad l9lawi');
					}

					// append the new message to the previous ones to display them
					setMessages((preveMessage) => [...preveMessage, messageData]);

					// reset the temp message that we dsiplay them to the user before the socket receive the events
					setTempMessages([]);

					// reset is typing to notif the receiver that the user no longer is typing
					setTyping("");

					// reset the display typing to make the front don't display is typing message to the user
					setDisplayTyping(null);
				}
				} else if (messageData.type === "read") {
					// if we received the read event
					console.log('readed');
					setReadedMessages(messageData); // set readed message with the message we received from the socket to update all unreaded messages
				} else if (messageData.type === "typing")
					// if we received the typing event
					setDisplayTyping(messageData); // increment the display typing state to know that the uer is still typing
				else if (messageData.type === "stopTyping")
					// if we received the stop typing event
					setDisplayTyping(null); // reset display typing, to remove the typing message from the conversation
				else if (messageData.type === 'friendRequest')
					getNotfications();
			}
		};
	}

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

  const deleteNotifications = async (notificationId) => {
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
	uid,
	displayTyping,
	readedMessages,

    ws,
    notifData,
    isWsConnected,
    setIsWsConnected,
    setFriendRequest,
    getNotfications,
    setNotifData,
    deleteNotifications,

	setMessages,
	setTempMessages,
	setTyping,
	setUid,
	setDisplayTyping,
	setReadedMessages,
  };

  return (
    <NotifContext.Provider value={contextData}>
      {children}
    </NotifContext.Provider>
  );
};
