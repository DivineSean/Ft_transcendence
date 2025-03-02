import { createContext, useContext, useEffect, useRef, useState } from "react";
import AuthContext from "./AuthContext";
import FetchWrapper from "../utils/fetchWrapper";
import useWebsocket from "../customHooks/useWebsocket";
import { AiFillMessage } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const NotifContext = createContext();

export default NotifContext;

export const NotifProvider = ({ children }) => {
  const navigate = useNavigate();
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
  const [friendsData, setFriendsData] = useState(null);

  const wsHook = useWebsocket(`ws/chat/`, {
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
          if (window.location.pathname.search("chat") === -1) getNotfications();
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
        } else if (messageData.type === "gameInvite") {
          getNotfications();
          authContextData.setGlobalMessage({
            message: `You get invited by @${messageData.senderUsername} to play the ${messageData.game} game.`,
          });
        } else if (messageData.type === "inviteTournament") {
          getNotfications();
          authContextData.setGlobalMessage({
            message: `You get invited by @${messageData.senderUsername} to play a tournament.`,
          });
        }
      }
    },
  });

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
  const getConversations = async () => {
    try {
      const res = await FetchData.get("api/chat/conversations/");
      if (res.ok) {
        const data = await res.json();
        setFriendsData(data);
      } else if (res.status) {
        const data = await res.json();
        if (res.status === 401) {
          authContextData.setGlobalMessage({
            message: "Unauthorized user. Access denied.",
            isError: true,
          });
          navigate("/login");
        }
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const getMessages = async (convId, setOffsetMssg) => {
    try {
      const res = await FetchData.get(`api/chat/messages/${convId}/0/`);

      if (res.status === 200) {
        const data = await res.json();
        if (data.messages.length === 20) setOffsetMssg(20);
        setMessages(data.messages);
      } else {
        navigate("/chat");
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const getChunkedMessages = async (
    convId,
    offsetMssg,
    setOfssetMssg,
    setIsChunked,
    setAllMessages,
  ) => {
    try {
      const res = await FetchData.get(
        `api/chat/messages/${convId}/${offsetMssg}/`,
      );

      if (res.status === 200) {
        const data = await res.json();
        setMessages((prevMessages) => [...data.messages, ...prevMessages]);
        if (data.next_offset === null) {
          setOfssetMssg(0);
          setAllMessages(true);
        } else {
          setOfssetMssg(data.next_offset);
          setIsChunked(true);
        }
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const inviteFriend = async (friendId, gameName, convId) => {
    try {
      const res = await FetchData.post(`api/games/${gameName}/invite/`, {
        friend_id: friendId,
        conversation_id: convId,
      });
      if (res.ok) {
        const data = await res.json();
        authContextData.setGlobalMessage({
          message: "The invitation has been sent successfully.",
          isError: false,
        });
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
  // ----------- end chat functions ----------- //

  const contextData = {
    friendsData,
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
    inviteFriend,
    setFriendsData,
  };

  return (
    <NotifContext.Provider value={contextData}>
      {children}
    </NotifContext.Provider>
  );
};
