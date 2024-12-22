import {
  IoSearchOutline,
  IoNotificationsOutline,
  IoNotifications,
} from "react-icons/io5";
import { useContext, useEffect, useRef, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import AuthContext from "../context/AuthContext";
import OptionsSection from "./OptionsSection";
import { TbLogout2 } from "react-icons/tb";
import { SlMenu } from "react-icons/sl";
import { Link } from "react-router-dom";
import Menu from "./Menu";
import FetchWrapper from "../utils/fetchWrapper";
import { BACKENDURL } from "../utils/fetchWrapper";
import UserContext from "../context/UserContext";
import NotifContext from "../context/NotifContext";

const navLinks = ["home", "profile", "chat", "rankings", "games", "explore"];

const Header = ({ ...props }) => {
  const { displayMenuGl, setDisplayMenuGl } = useContext(AuthContext);
  const [displayOptions, setDisplayOptions] = useState(false);
  const [displayNotification, setDisplayNotification] = useState(false);
  const [readNotif, setReadNotif] = useState(false);
  const contextData = useContext(UserContext);
  const notifContext = useContext(NotifContext);

  useEffect(() => {
    notifContext.getNotfications();
  }, []);

  const optionsData = [
    {
      name: "logout",
      icon: <TbLogout2 />,
    },
  ];

  const optionSectionRef = useRef(null);
  const toggleOptionsRef = useRef([]);

  const toggleMenu = () => {
    setDisplayMenuGl(!displayMenuGl);
  };

  const toggleNotification = () => {
    if (displayOptions) setDisplayOptions(false);
    ``;
    setReadNotif(true);
    setDisplayNotification(!displayNotification);
  };

  const toggleOptions = () => {
    if (displayNotification) setDisplayNotification(false);
    setDisplayOptions(!displayOptions);
  };

  const handleClickOutside = (event) => {
    if (
      optionSectionRef.current &&
      !optionSectionRef.current.contains(event.target)
    ) {
      if (
        toggleOptionsRef.current[0] &&
        !toggleOptionsRef.current[0].contains(event.target) &&
        toggleOptionsRef.current[1] &&
        !toggleOptionsRef.current[1].contains(event.target)
      ) {
        setDisplayOptions(false);
        setDisplayNotification(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    contextData.getUserInfo();
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const linkes = [];
  navLinks.forEach((link) => {
    let redirectLink = link;
    if (redirectLink === "profile") redirectLink = "profile/overview";
    if (props.link === link) {
      linkes.push(
        <li className="flex gap-2 flex-col justify-center" key={link}>
          <Link
            to={`/${redirectLink}`}
            className="text-white lg:text-h-lg-md font-semibold"
            key={link}
          >
            {link}
          </Link>
          <div className="h-3 rounded bg-green"></div>
        </li>,
      );
    } else {
      linkes.push(
        <li className="flex flex-col justify-center" key={link}>
          <Link
            to={`/${redirectLink}`}
            className="text-white lg:text-h-lg-md font-semibold"
            key={link}
          >
            {link}
          </Link>
          <div className="h-3 hidden rounded bg-green"></div>
        </li>,
      );
    }
  });

  return (
    <>
      {displayMenuGl && <Menu link={props.link} />}
      <div className="items-center w-full max-w-[1440px] z-[10000] fixed top-0 left-1/2 transform -translate-x-1/2">
        <div className="relative w-full">
          {displayOptions && (
            <OptionsSection
              // contextData={contextData}
              data={optionsData}
              reference={optionSectionRef}
              type="options"
            />
          )}
          {displayNotification && (
            <OptionsSection
              //   data={notificationData}
              reference={optionSectionRef}
              type="notification"
            />
          )}
        </div>
      </div>
      <header className="backdrop-blur-3xl sticky top-0 z-[2] lg:px-0 px-16">
        <div className="flex items-center lg:gap-32 gap-16 py-16 max-w-[1440px] m-auto lg:px-32 relative">
          <Link
            to="/home"
            className="text-white lg:text-h-md-lg text-h-sm-lg font-semibold cursor-pointer"
          >
            <img
              src="/images/logo.png"
              alt="logo"
              className="w-full h-[50px]"
            />
          </Link>
          <nav className="lg:flex grow hidden lg:justify-center justify-end">
            <ul className="flex lg:gap-32 gap-16 itmes-center"> {linkes} </ul>
          </nav>
          <div className="flex grow justify-center">
            <div className="flex items-center relative lg:w-full md:w-[60%] w-[90%]">
              <input
                type="text"
                placeholder="find users"
                className="search-glass text-txt-xs px-32 py-8 outline-none text-white w-full"
              />
              <IoSearchOutline className="text-gray absolute left-8 text-txt-md" />
            </div>
          </div>
          <div
            ref={(el) => (toggleOptionsRef.current[0] = el)}
            onClick={toggleNotification}
            className="relative flex items-center cursor-pointer"
          >
            {!displayNotification && (
              <IoNotificationsOutline className="text-white text-h-lg-lg" />
            )}
            {displayNotification && (
              <IoNotifications className="text-white text-h-lg-lg" />
            )}

            {notifContext.notifData &&
              notifContext.notifData.unreadCount !== 0 && (
                <span className="absolute flex p-4 h-16 min-w-16 flex items-center justify-center font-bold text-txt-xs bg-red rounded-full left-0 top-0 overflow-hidden">
                  {notifContext.notifData.unreadCount <= 4
                    ? notifContext.notifData.unreadCount
                    : "+4"}
                </span>
              )}
          </div>
          <div
            ref={(el) => (toggleOptionsRef.current[1] = el)}
            onClick={toggleOptions}
            className="bg-gray w-32 h-32 rounded-full lg:flex hidden overflow-hidden cursor-pointer border-[0.5px] border-stroke-sc"
          >
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
          <div onClick={toggleMenu} className="lg:hidden block cursor-pointer">
            <SlMenu className="text-white text-h-lg-lg" />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
