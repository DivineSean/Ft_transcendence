import { useNavigate } from "react-router-dom";
import { BACKENDURL } from "../../utils/fetchWrapper";
import { useContext } from "react";
import NotifContext from "../../context/NotifContext";
import { useEffect } from "react";
import { TbDeviceGamepad3Filled } from "react-icons/tb";

const FriendsChat = ({ uid, friendInfo }) => {
  const navigate = useNavigate();
  const notifContextData = useContext(NotifContext);

  const sendReadMessage = (friendInfo) => {
    if (notifContextData.wsHook) {
      notifContextData.wsHook.send(
        JSON.stringify({
          message: "message is readed",
          type: "read",
          convId: friendInfo.conversationId,
        }),
      );
    }
  };

  const handleReadMessage = () => {
    sendReadMessage(friendInfo);
    friendInfo.isRead = true;
    navigate(`/chat/${friendInfo.conversationId}`);
  };

  useEffect(() => {
    if (uid === friendInfo.conversationId) {
      sendReadMessage(friendInfo);
    }
  }, [uid]);

  return (
    <div
      onClick={handleReadMessage}
      className={`text-white flex gap-16 p-8 rounded-[8px] hover:hover-secondary
					cursor-pointer ${friendInfo.conversationId === uid && "hover-secondary"}`}
    >
      <div className="relative">
        {!friendInfo.isRead && !friendInfo.sender && friendInfo.lastMessage && (
          <div className="absolute font-bold uppercase text-[10px] lg:hidden md:block hidden top-0 right-0 text-black bg-green rounded-lg py-2 px-4">
            new
          </div>
        )}
        <div
          className={`w-56 h-56 rounded-full flex border-2 ${(friendInfo.status === 'online' || friendInfo.status === 'in-game') && !friendInfo.isBlocked ? "border-green" : "border-stroke-sc"} overflow-hidden`}
        >
          <img
            src={
              friendInfo.profile_image
                ? BACKENDURL + friendInfo.profile_image
                : "/images/default.jpeg"
            }
            alt="img"
            className="grow object-cover"
          />
        </div>
        {!friendInfo.isBlocked && friendInfo.status !== "in-game" && (
          <div
            className={`absolute w-16 h-16 ${friendInfo.status === 'online' && "bg-green"}
							${friendInfo.status === 'offline' && "bg-black border-[3px] border-stroke-sc"}
							rounded-full right-0 bottom-0
						`}
          ></div>
        )}
				{!friendInfo.isBlocked && friendInfo.status === "in-game" && (
          <div className={`absolute rounded-full flex items-center justify-center -right-2 bottom-0 p-2 bg-black/80 border border-green`}>
						<TbDeviceGamepad3Filled className="text-green" />
					</div>
        )}
      </div>

      <div className="grow lg:flex flex justify-between gap-16 md:hidden">
        <div className="flex flex-col justify-center gap-8">
          <div className="text-h-sm-xs font-semibold normal-case max-w-[140px] truncate">
            {friendInfo.first_name} {friendInfo.last_name}
          </div>

          {(!notifContextData.displayTyping ||
            (notifContextData.displayTyping &&
              notifContextData.displayTyping.convId !==
                friendInfo.conversationId)) && (
            <div
              className={`text-txt-xs text-stroke-sc max-w-[140px] truncate ${!friendInfo.isRead && !friendInfo.sender && "font-semibold text-white"}`}
            >
              {!friendInfo.lastMessage ? (
                <p className="text-stroke-sc font-normal">new conversation</p>
              ) : (
                friendInfo.lastMessage
              )}
            </div>
          )}

          {notifContextData.displayTyping &&
            notifContextData.displayTyping.convId ===
              friendInfo.conversationId && (
              <div className="text-txt-xs font-bold text-green">typing...</div>
            )}
        </div>

        <div className="flex flex-col justify-center items-end gap-8">
          <p className="text-txt-xs font-lighter text-stroke-sc">
            {friendInfo.messageDate}
          </p>
          <div>
            {!friendInfo.isRead &&
              !friendInfo.sender &&
              friendInfo.lastMessage && (
                <p className="text-txt-xs text-green font-bold">new</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsChat;
