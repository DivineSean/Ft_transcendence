import { createContext, useContext, useEffect, useRef, useState } from "react";
import AuthContext from "./AuthContext";
import FetchWrapper from "../utils/fetchWrapper";
import useWebsocket from "../customHooks/useWebsocket";
import { AiFillMessage } from "react-icons/ai";

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
  const [refresh, setRefresh] = useState(false);

  const wsHook = useWebsocket(
    `wss://${window.location.hostname}:8000/ws/chat/`,
    {
      onOpen: () => {
        setIsWsConnected(true);
      },
      onMessage: (e) => {
        const messageData = JSON.parse(e.data); // parse the event data

        if (messageData) {
          if (messageData.type === "read") {
            // if we received the read event
            setReadedMessages(messageData); // set readed message with the message we received from the socket to update all unreaded messages
          } else if (messageData.type === "typing") {
            // if we received the typing event
            setDisplayTyping(messageData); // increment the display typing state to know that the uer is still typing
          } else if (messageData.type === "stopTyping") {
            // if we received the stop typing event
            setDisplayTyping(null); // reset display typing, to remove the typing message from the conversation
            setTyping("");
          } else if (messageData.type === "friendRequest") {
            getNotfications();
          } else if (messageData.type === "createConv") {
            if (window.location.pathname.search("chat") === -1)
              getNotfications();
          } else if (
            messageData.type === "messageNotif" &&
            window.location.pathname.search("chat") === -1
          ) {
            authContextData.setGlobalMessage({
              message: messageData.message,
              isError: false,
              icon: <AiFillMessage className="text-green text-txt-md" />,
              username: messageData.username,
            });
          } else if (messageData.type === "convBlocked") {
            setRefresh(true);
            authContextData.setGlobalMessage({
              message: messageData.message,
              isError: true,
            });
          } else if (messageData.type === "acceptFriendRequest") {
            getNotfications();
          }
        }
      },
    },
  );

  const getNotfications = async () => {
    try {
      const res = await FetchData.get("api/notification/");
      if (res.ok) {
        const data = await res.json();
        setNotifData(data);
      } else if (res.status === 400) {
        const data = await res.json();
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const readNotification = async (notificationId) => {
    try {
      const res = await FetchData.delete(`api/notification/${notificationId}/`);
      if (res.ok) {
        getNotfications();
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

    // ----------- start chat functions ----------- //
	const getConversations = async (setData, setGlobalMessage, navigate) => {
		try {
		  const res = await FetchData.get("api/chat/conversations/");
		  if (res.ok) {
			const data = await res.json();
			setData(data);
		  } else if (res.status) {
			const data = await res.json();
			if (res.status === 401) {
			  setGlobalMessage({ message: "unauthorized user", isError: true });
			  navigate("/login");
			}
		  }
		} catch (error) {
		  authContextData.setGlobalMessage({
			  message: error.message,
			  isError: true,
		  })
		}
	  };
	
	  const getMessages = async (convId, setData, setOffsetMssg, navigate) => {
		try {
		  const res = await FetchData.post("chat/getMessages/", {
			convID: convId,
			offset: 0,
		  });
	  
		  if (res.status !== 500) {
			const data = await res.json();
			if (res.status === 200) {
			  if (data.messages.length === 20) setOffsetMssg(20);
			  setData(data.messages);
			} else {
			  navigate("/chat");
			}
		  } else {
			console.log("internal server error 500");
		  }
		} catch (error) {
		  authContextData.setGlobalMessage({
			  message: error.message,
			  isError: true,
		  })
		}
	  };
	
	  const getChunkedMessages = async (
		convId,
		setData,
		offsetMssg,
		setOfssetMssg,
		setIsChunked,
		setAllMessages,
	  ) => {
		try {
		  const res = await FetchData.post("chat/getMessages/", {
			convID: convId,
			offset: offsetMssg,
		  });
	  
		  if (res.status !== 500) {
			const data = await res.json();
			if (res.status === 200) {
			  setData((prevMessages) => [...data.messages, ...prevMessages]);
			  if (data.next_offset === null) {
				setOfssetMssg(0);
				setAllMessages(true);
			  } else {
				setOfssetMssg(data.next_offset);
				setIsChunked(true);
			  }
			}
		  } else {
			console.log("internal server error 500");
		  }
		} catch (error) {
		  authContextData.setGlobalMessage({
			  message: error.message,
			  isError: true,
		  })
		}
	  };
	  // ----------- end chat functions ----------- //

  const contextData = {
    updatedConversation,
    tempMessages,
    messages,
    typing,
    displayTyping,
    readedMessages,
    refresh,

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
    setRefresh,

	getConversations,
	getMessages,
	getChunkedMessages,
  };

  return (
    <NotifContext.Provider value={contextData}>
      {children}
    </NotifContext.Provider>
  );
};
