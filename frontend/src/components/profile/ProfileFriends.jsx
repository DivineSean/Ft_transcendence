import { IoSearchOutline } from "react-icons/io5";
import { TiThMenu } from "react-icons/ti";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { useContext, useEffect, useRef, useState } from "react";
import UserContext from "../../context/UserContext";
import { BACKENDURL } from "../../utils/fetchWrapper";
import { useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa6";

const Friends = ({ friend }) => {
  const navigate = useNavigate();
  return (
    <div className="flex h-[72px] w-full gap-16 p-8 items-center justify-between secondary-glass-friends">
      <div
        onClick={() => navigate("/profile/overview/" + friend.username)}
        className="flex gap-16 grow cursor-pointer"
      >
        <div className="flex rounded-full min-w-[56px] w-[56px] h-[56px] border-[0.5px] border-stroke-sc overflow-hidden">
          <img
            src={
              friend.profile_image
                ? `${BACKENDURL}${friend.profile_image}`
                : "/images/default.jpeg"
            }
            alt="Friend Personal image"
            className="object-cover grow pointer-events-none"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-txt-sm md:text-txt-md font-bold cursor-pointer truncate max-w-[160px]">
            {`${friend.first_name} ${friend.last_name}`}
          </div>
          <div className="text-txt-xs text-gray max-w-[120px] truncate">
            @{friend.username}
          </div>
        </div>
      </div>
    </div>
  );
};

const FriendRequest = ({ friendRequest, type }) => {
  const contextData = useContext(UserContext);
  const navigate = useNavigate();
  return (
    <div className="w-[150px] secondary flex-shrink-0 border-[0.5px] border-stroke-sc flex flex-col rounded-md overflow-hidden">
      <div
        onClick={() => navigate("/profile/overview/" + friendRequest.username)}
        className="overflow-hidden grow flex border-b-[0.5px] border-stroke-sc relative cursor-pointer"
      >
        <div className="absolute bg-black h-[70%] w-full cover-gradient bottom-0"></div>
        <img
          src={
            friendRequest.profile_image
              ? `${BACKENDURL}${friendRequest.profile_image}`
              : "/images/default.jpeg"
          }
          alt="request"
          className="object-cover grow pointer-events-none"
        />
        <div className="text-txt-xs p-8 pt-16 text-whiter w-full tracking-wide font-semibold absolute bottom-0 cover-gradient max-w-full truncate">
          {friendRequest.first_name} {friendRequest.last_name}
        </div>
      </div>
      <div className="p-8 flex gap-8 justify-center items-center">
        {type === "friend request" && (
          <>
            <button
              onClick={() => contextData.acceptFriendRequest(friendRequest.id)}
              className="hover-secondary text-green p-8 transition-all rounded-md grow flex justify-center hover:bg-green hover:text-black"
            >
              <IoMdCheckmark className="text-lg" />
            </button>

            <button
              onClick={() => contextData.declineRequest(friendRequest.id)}
              className="hover-secondary text-red p-8 transition-all rounded-md flex justify-center hover:bg-red hover:text-white"
            >
              <IoMdClose className="text-lg" />
            </button>
          </>
        )}
        {type === "blocked users" && (
          <button
            onClick={() => contextData.unblockUser(friendRequest.id)}
            className="hover-secondary text-green p-8 transition-all font-bold rounded-md grow flex justify-center hover:bg-green hover:text-black"
          >
            Unblock user
          </button>
        )}
      </div>
    </div>
  );
};

const ProfileFriends = ({ username }) => {
  const userContextData = useContext(UserContext);
  const scrollContainer = useRef(null);
  const friends = [];

  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    userContextData.getFriends(username);
    if (userContextData.profileInfo && userContextData.profileInfo.me) {
      userContextData.getFriendRequest();
      userContextData.getBlockedUsers();
    }
  }, [userContextData.profileInfo]);

  if (userContextData.userFriends) {
    userContextData.userFriends.friends.map((item) => {
      friends.push(<Friends key={item.id} friend={{ ...item }} />);
    });
  }

  const friendRequest = [];

  const requestOrBlocked = (items, type) => {
    items.map((item) => {
      friendRequest.push(
        <FriendRequest key={item.id} friendRequest={{ ...item }} type={type} />,
      );
    });
  };

  const [selected, setSelected] = useState("friend request");
  const [displaySelect, setDisplaySelect] = useState(false);
  const select = ["friend request", "blocked users"];

  if (userContextData.profileInfo && userContextData.profileInfo.me) {
    if (selected === "friend request" && userContextData.userFriendRequest)
      requestOrBlocked(userContextData.userFriendRequest, selected);
    else if (selected === "blocked users" && userContextData.blockedUsers)
      requestOrBlocked(userContextData.blockedUsers.blockedUsers, selected);
  }

  return (
    <>
      <div className="flex flex-col gap-32 h-full w-full no-scrollbar overflow-y-scroll">
        {userContextData &&
          userContextData.userInfo &&
          userContextData.userInfo.username ===
            userContextData.profileInfo.username && (
            <div className="flex flex-col gap-8 items-start">
              {/* add select to switch between blocked users and friend requests */}
              <div className="flex justify-start relative">
                <div
                  onClick={() => setDisplaySelect(!displaySelect)}
                  className="flex gap-16 items-center p-8 px-16 border-b-[0.5px] border-stroke-sc cursor-pointer"
                >
                  <h2 className="font-semibold tracking-wide cursor-pointer">
                    {selected}
                  </h2>
                  <FaChevronDown className="text-green cursor-pointer" />
                  {displaySelect && (
                    <ul
                      className="absolute top-[44px] z-[1] left-0 overflow-hidden text-center w-full flex flex-col
												bg-[url('/images/background.png')] bg-cover bg-bottom transition-all rounded-md p-8 gap-4 border-[0.5px] border-stroke-sc"
                    >
                      <div className="absolute w-full h-full backdrop-blur-3xl z-[-1] rounded-md top-0 left-0"></div>
                      {select.map((item, i) => (
                        <li
                          key={i}
                          onClick={() => setSelected(item)}
                          className={`tracking-wider bg-gray/5 hover:bg-gray/15
														shadow p-8 transition-all cursor-pointer
														${selected === item ? "bg-gray/10" : ""}
													`}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="relative w-full">
                {friendRequest.length ? (
                  <div
                    ref={scrollContainer}
                    className="min-h-[240px] overflow-x-auto no-scrollbar w-full p-8 flex gap-16 scroll-smooth bg-black/15 rounded-md"
                  >
                    {friendRequest}
                    <button
                      onClick={scrollRight}
                      className="absolute top-1/2 -translate-y-1/2 right-0 p-10 flex arrow-glass transition-all text-white rounded-full hover:bg-black/50"
                    >
                      <FaChevronRight />
                    </button>

                    <button
                      onClick={scrollLeft}
                      className="absolute top-1/2 -translate-y-1/2 left-0 p-10 flex arrow-glass transition-all text-white rounded-full hover:bg-black/50"
                    >
                      <FaChevronLeft />
                    </button>
                  </div>
                ) : (
                  <p className="text-txt-sm flex justify-center text-stroke-sc lowercase">
                    you have no {selected}.
                  </p>
                )}
              </div>
            </div>
          )}
        <div className="flex flex-col gap-8">
          <h2 className="font-semibold tracking-wide ">friends</h2>
          {friends.length ? (
            <div className="grid gap-16 sm:grid-cols-2 grid-cols-1">
              {friends}
            </div>
          ) : (
            <p className="text-txt-sm flex justify-center text-stroke-sc lowercase">
              you have no friend yet search for some you want
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileFriends;
