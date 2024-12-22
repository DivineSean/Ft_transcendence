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
import LoadingPage from "./LoadingPage";
import NotifContext from "../context/NotifContext";

const Chat = () => {
  // const ws = useRef(null);
  const { uid } = useParams();
  const navigate = useNavigate();
  const { setGlobalMessage } = useContext(AuthContext);
  const notifContextData = useContext(NotifContext);
  // states
  const [friendsData, setFriendsData] = useState(null);
  // const [isWsConnected, setIsWsConnected] = useState(false);
  const [conversationSide, setConversationSide] = useState(true);
  const [profileSide, setProfileSide] = useState(
    window.innerWidth <= 768 ? false : true,
  );

  useEffect(() => {
    // first time fetch conversation message from the database to render them to the user
    getConversations(setFriendsData, setGlobalMessage, navigate);
  }, []);


	useEffect(() => {
		notifContextData.setUid(uid)
		return () => {
			notifContextData.setUid(null);
		}
	}, [uid]);

  useEffect(() => {
    // if the updatedConversation is updated thats mean we need to update chat friend component
    if (notifContextData.updatedConversation && friendsData) {
      // find the conversation that we are already entered into it
      const findConv = friendsData.users.filter(
        (user) => user.conversationId === notifContextData.updatedConversation.convId,
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
        (user) => user.conversationId !== notifContextData.updatedConversation.convId,
      );

      // then resort them to make the updated conversation the first one
      // console.log(updatedConversation);
      setFriendsData({
        ...friendsData,
        users: [findConv, ...newFriendsData],
      });
    }
  }, [notifContextData.updatedConversation]);

  // console.log('friendsData++++++', friendsData);

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
              <ChatFriends
                friendsData={friendsData}
                displayTyping={notifContextData.displayTyping}
                uid={uid}
              />
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
