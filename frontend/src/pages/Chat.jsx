import ProfileOptions from "../components/chat/ProfileOptions";
import Conversation from "../components/chat/Conversation";
import { useParams, useLocation } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { getConversations } from "../utils/chatFetchData";
import AuthContext from "../context/AuthContext";
import ChatFriends from "../components/chat/ChatFriends";
import LoadingPage from "./LoadingPage";
import NotifContext from "../context/NotifContext";

const Chat = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { setGlobalMessage } = useContext(AuthContext);
  const notifContextData = useContext(NotifContext);
  const location = useLocation();

  // states
  const [friendsData, setFriendsData] = useState(null);
  const [conversationSide, setConversationSide] = useState(true);
  const [profileSide, setProfileSide] = useState(
    window.innerWidth <= 768 ? false : true,
  );

  useEffect(() => {
    // first time fetch conversation message from the database to render them to the user
    getConversations(setFriendsData, setGlobalMessage, navigate);
  }, []);

  useEffect(() => {
    const handleMessageReceived = (e) => {
      const messageData = JSON.parse(e.data); // parse the event data

      if (messageData) {
        // check if the event data is not empty then do the whole work
        if (messageData.type === "message") {
          // if we received the message event
          notifContextData.setUpdatedConversation(messageData); // set the updated data for the left side (friend chat)
          // console.log(messageData);
          console.log("messssssaaaage", messageData);

          console.log("message wsslni abro", uid);
          if (uid && messageData.convId === uid) {
            // check if the user is entered to the conversation that received the message

            if (!messageData.isSender) {
              // check if the user is the receiver then send to the sender that the message is readed
              notifContextData.wsHook.send(
                JSON.stringify({
                  message: "message is readed",
                  type: "read",
                  convId: uid,
                }),
              );
              console.log("dkhel lhad l9lawi");
            }

            // append the new message to the previous ones to display them
            notifContextData.setMessages((preveMessage) => [
              ...preveMessage,
              messageData,
            ]);

            // reset the temp message that we dsiplay them to the user before the socket receive the events
            notifContextData.setTempMessages([]);
            console.log("raha tsetitat blekhwa temp message");

            // reset is typing to notif the receiver that the user no longer is typing
            notifContextData.setTyping("");

            // reset the display typing to make the front don't display is typing message to the user
            notifContextData.setDisplayTyping(null);
          }
        } else if (messageData.type === "createConv") {
          console.log("chaaaaaaaaat");
          if (location.pathname.search("chat") !== -1) {
            getConversations(setFriendsData, setGlobalMessage, navigate);
            notifContextData.readNotification(messageData.notifId);
          }
        }
      }
    };

    notifContextData.wsHook.addMessageHandler(handleMessageReceived);

    return () => {
      notifContextData.wsHook.removeMessageHandler(handleMessageReceived);
    };
  });

  let friendInfo = []; // get the conversation that have the same uid that we have in the url
  if (friendsData && friendsData.users && friendsData.users.length) {
    friendInfo = friendsData.users.filter((u) => u.conversationId === uid)[0];
  }

  // this event listener just for the small media if the window is resized the profileOption component will disappear
  window.addEventListener("resize", () => {
    if (!conversationSide) setConversationSide(true);
    if (window.innerWidth < 768) setProfileSide(false);
    if (window.innerWidth >= 768) setProfileSide(true);
  });

  useEffect(() => {
    // if the updatedConversation is updated thats mean we need to update chat friend component
    if (notifContextData.updatedConversation && friendsData) {
      // find the conversation that we are already entered into it
      const findConv = friendsData.users.filter(
        (user) =>
          user.conversationId === notifContextData.updatedConversation.convId,
      )[0];

      // then update the values inside that conversation
      if (findConv) {
        findConv.lastMessage = notifContextData.updatedConversation.message;
        findConv.messageDate = notifContextData.updatedConversation.timestamp;
        findConv.isRead = notifContextData.updatedConversation.isRead;
        findConv.sender = notifContextData.updatedConversation.isSender;

        if (uid && findConv.conversationId === uid) findConv.isRead = true;
      }

      // get all other conversation
      const newFriendsData = friendsData.users.filter(
        (user) =>
          user.conversationId !== notifContextData.updatedConversation.convId,
      );

      // then resort them to make the updated conversation the first one
      // console.log(updatedConversation);
      setFriendsData({
        ...friendsData,
        users: [findConv, ...newFriendsData],
      });
    }
  }, [notifContextData.updatedConversation]);

  return (
    <div className="flex flex-col grow lg:gap-32 gap-16">
      <Header link="chat" />
      {!friendsData && <LoadingPage />}
      {friendsData && (
        <div className="container md:px-16 px-0">
          <div className="primary-glass p-16 flex gap-16 grow">
            <div
              className={`lg:w-[320px] md:w-[72px] w-full flex-col gap-32 ${uid ? "md:flex hidden" : "flex"}`}
            >
              <div className="lg:flex md:hidden flex items-center relative w-full">
                <input
                  type="text"
                  placeholder="find users"
                  className="search-glass text-txt-xs px-32 py-8 outline-none text-white w-full"
                />
                <IoSearchOutline className="text-gray absolute left-8 text-txt-md" />
              </div>
              <ChatFriends friendsData={friendsData} uid={uid} />
            </div>

            <div className="w-[0.5px] bg-stroke-sc md:block hidden"></div>

            {uid && friendInfo && (
              <>
                {conversationSide && (
                  <Conversation
                    uid={uid}
                    friendInfo={friendInfo}
                    displayProfile={setProfileSide}
                    hideSelf={setConversationSide}
                  />
                )}
                <div className="w-[0.5px] bg-stroke-sc md:block hidden"></div>
                {profileSide && (
                  <ProfileOptions
                    uid={uid}
                    friendInfo={friendInfo}
                    displayCoversation={setConversationSide}
                    hideSelf={setProfileSide}
                    isVisible={profileSide}
                  />
                )}
              </>
            )}

            {(!uid || !friendInfo) && (
              <div className="grow md:flex hidden flex-col gap-16 justify-center items-center text-gray">
                <div className="contrast-75 grayscale-[50%] w-[300px] h-[300px] bg-[url('/images/chat.png')] bg-cover bg-center"></div>
                <p className="w-[300px] font-light tracking-wider text-center text-txt-sm">
                  Send and receive messanges with your friends freely and
                  securely.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
