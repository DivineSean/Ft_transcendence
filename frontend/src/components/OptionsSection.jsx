import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useRef } from "react";
import { BACKENDURL } from "../utils/fetchWrapper";
import UserContext from "../context/UserContext";
import NotifContext from "../context/NotifContext";

const OptionsSection = ({ data, type, reference }) => {
  const sectionRef = useRef([]);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const contextData = useContext(UserContext);
  const notifContext = useContext(NotifContext);

  const handleReadNotif = (item) => {
    if (item.notifType === "FR" || item.notifType === "AF") {
      navigate(`/profile/overview/${item.senderId.username}`);
      contextData.setRefresh(true);
    } else if (item.notifType === "IG") {
      navigate(`/chat/${item.targetId}`);
    } else if (item.notifType === "IT") {
      navigate(`/games/${item.game}/online/${item.targetId}`);
    } else if (item.notifType === "CC") {
      navigate(`/chat/${item.targetId}`);
    }

    notifContext.readNotification(item.notificationId);
  };

  const handleClick = (index) => {
    const clickedItem = sectionRef.current[index];
    if (clickedItem.textContent === "logout") {
      logout();
    }
  };

  useEffect(() => {
    if (type === "notification") {
      notifContext.getNotfications();
    }
  }, []);

  return (
    <>
      <div
        className={`
			h-10 w-4 rounded-full bg-stroke-sc absolute top-[59px]
			${type === "options" && "lg:block hidden lg:right-[46px]"}
			${type === "notification" && "lg:right-[109px] right-[75px]"}
		`}
      ></div>
      <div
        ref={reference}
        className={`
			options-glass z-[1000] py-8
			absolute flex-col top-64 rounded-md max-h-[300px]
			${type === "options" && "lg:flex hidden lg:right-32 p-8 gap-16 w-[250px]"}
			${type === "notification" && "flex lg:right-[90px] px-8 right-16 ml-16 min-w-[300px] md:ml-0 max-w-[440px]"}
		`}
      >
        {type === "notification" && (
          <h2 className="font-bold p-8 tracking-wide text-h-dm-md text-center">
            Notifications
          </h2>
        )}
        {type === "options" && (
          <div
            onClick={() => {
              contextData.setProfileInfo(contextData.userInfo);
              navigate("/profile/overview");
            }}
            className="flex gap-16 p-8 cursor-pointer hover-secondary rounded items-center"
          >
            <div className="bg-gray min-w-32 max-w-32 h-32 rounded-full lg:flex hidden overflow-hidden cursor-pointer">
              <img
                src={
                  contextData.userInfo && contextData.userInfo.profile_image
                    ? `${BACKENDURL}${contextData.userInfo.profile_image}?t=${new Date().getTime()}`
                    : "/images/default.jpeg"
                }
                alt="profile pic"
                className="grow object-cover"
              />
            </div>
            <h2 className="text-h-sm-sm tracking-wide lowercase truncate">
              {contextData.userInfo && contextData.userInfo.username}
            </h2>
          </div>
        )}
        {type === "options" && (
          <ul className="w-full flex flex-col gap-8">
            {data.map((section, i) => (
              <li
                key={i}
                ref={(el) => (sectionRef.current[i] = el)}
                onClick={() => handleClick(i)}
                className={`cursor-pointer p-8 w-full rounded flex gap-16 items-center bg-black/40
								text-txt-sm ${section.name !== "logout" ? "hover:hover-secondary" : "hover:bg-logout-bg"}
							`}
              >
                {section.icon}
                {section.name}
              </li>
            ))}
          </ul>
        )}
        {type === "notification" && (
          <>
            <ul className="w-full flex flex-col gap-8 h-full overflow-auto custom-scrollbar pr-8">
              {notifContext.notifData &&
                notifContext.notifData.notifications.map((item) => (
                  <li
                    onClick={() => handleReadNotif(item)}
                    key={item.notificationId}
                    className="cursor-pointer p-8 w-full rounded flex gap-16 items-center bg-black/40 text-txt-xs justify-start hover:hover-secondary"
                  >
                    <div className="flex grow gap-8 items-center">
                      <div className="h-40 min-w-40 max-w-40 rounded-full overflow-hidden flex border-[0.5px] border-stroke-sc">
                        <img
                          src={
                            item && item.senderId.profile_image
                              ? `${BACKENDURL}${item.senderId.profile_image}?t=${new Date().getTime()}`
                              : "/images/default.jpeg"
                          }
                          alt="sender"
                          className="object-cover grow"
                        />
                      </div>
                      <div className="flex flex-col gap-4 items-end grow tracking-wider">
                        <p
                          className={`${!item.isRead ? "font-semibold" : "font-normal text-stroke-sc"} flex gap-4 justify-between w-full`}
                        >
                          {item.notifMessage}
                          <span
                            className={`font-semibold ${!item.isRead ? "text-red" : "text-stroke-sc"} truncate max-w-[120px]`}
                          >
                            {item.senderUsername}
                          </span>
                        </p>
                        <p
                          className={`${!item.isRead ? "text-green" : "text-stroke-sc"}`}
                        >
                          {item.timestamp}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
            {notifContext.notifData &&
              !notifContext.notifData.notifications.length && (
                <p className="text-center text-txt-sm text-stroke-sc">
                  no notifications
                </p>
              )}
          </>
        )}
      </div>
    </>
  );
};

export default OptionsSection;
