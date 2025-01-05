import React, { useContext } from "react";
import "react-circular-progressbar/dist/styles.css";
import UserContext from "../../context/UserContext";
import { MdOutlineBlock } from "react-icons/md";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoMdPersonAdd } from "react-icons/io";
import { ImUserPlus, ImUserMinus } from "react-icons/im";

const FriendManagementButtons = ({ setApproval }) => {
  const contextData = useContext(UserContext);

  const handleApprovedAction = (type) => {
    setApproval({
      visible: true,
      message:
        type === "unfriend"
          ? `if you change your mind, you'll have to send friend request to`
          : `if you change your mind, you'll have to unblock`,
      type: type,
    });
  };
  return (
    <>
      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        contextData.profileInfo.isFriend && (
          <button
            onClick={contextData.createConversation}
            className="secondary-glass grow lg:w-full p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
          >
            <IoChatbubbleEllipsesOutline />
            <p>message</p>
          </button>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        !contextData.profileInfo.isFriend &&
        !contextData.profileInfo.isSentRequest &&
        !contextData.profileInfo.isReceiveRequest && (
          <button
            onClick={() =>
              contextData.sendFriendRequest(contextData.profileInfo.id)
            }
            className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
          >
            <IoMdPersonAdd />
            <p>add friend</p>
          </button>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        !contextData.profileInfo.isFriend &&
        contextData.profileInfo.isReceiveRequest && (
          <button
            onClick={contextData.cancelFriendRequest}
            className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide"
          >
            <ImUserMinus />
            <p>cancel request</p>
          </button>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        !contextData.profileInfo.isFriend &&
        contextData.profileInfo.isSentRequest && (
          <>
            <button
              onClick={() =>
                contextData.acceptFriendRequest(contextData.profileInfo.id)
              }
              className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
            >
              <ImUserPlus />
              <p>confirm</p>
            </button>
            <button
              onClick={() =>
                contextData.declineRequest(contextData.profileInfo.id)
              }
              className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide"
            >
              <ImUserMinus />
              <p>delete</p>
            </button>
          </>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        contextData.profileInfo.isUserBlocked && (
          <>
            <button
              onClick={() =>
                contextData.unblockUser(contextData.profileInfo.id)
              }
              className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
            >
              <ImUserMinus />
              <p>unblock</p>
            </button>
            {/* <p className="text-center normal-case text-txt-xs text-red">this user have been blocked by you click to unblock</p> */}
          </>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        contextData.profileInfo.isFriend && (
          <button
            onClick={() => handleApprovedAction("unfriend")}
            className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide"
          >
            <ImUserMinus />
            <p>unfriend</p>
          </button>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        contextData.profileInfo.isFriend && (
          <button
            onClick={() => handleApprovedAction("block")}
            className="secondary-glass text-txt-sm p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide"
          >
            <MdOutlineBlock />
            <p>block</p>
          </button>
        )}
    </>
  );
};

export default FriendManagementButtons;
