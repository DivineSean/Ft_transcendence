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
import { Link, useNavigate } from "react-router-dom";
import Menu from "./Menu";
import FetchWrapper from "../utils/fetchWrapper";
import { BACKENDURL } from "../utils/fetchWrapper";
import UserContext from "../context/UserContext";
import NotifContext from "../context/NotifContext";

const navLinks = [
  "home",
  "profile",
  "chat",
  "games",
  "tournaments",
  "rankings",
];

const Header = ({ ...props }) => {
  const authContextData = useContext(AuthContext);
  const [displayOptions, setDisplayOptions] = useState(false);
  const [displayNotification, setDisplayNotification] = useState(false);
  const [readNotif, setReadNotif] = useState(false);
  const contextData = useContext(UserContext);
  const notifContext = useContext(NotifContext);
  const [searchResult, setSearchResult] = useState(false);
  const searchResultRef = useRef(null);
  const searchBarRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const FetchData = new FetchWrapper();
  const [foundUsers, setFoundUsers] = useState([]);
  const navigate = useNavigate();

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
    authContextData.setDisplayMenuGl(!authContextData.displayMenuGl);
  };

  const toggleNotification = () => {
    if (displayOptions) setDisplayOptions(false);
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

	if (
		searchResultRef.current &&
		!searchResultRef.current.contains(event.target) &&
		searchBarRef.current &&
		!searchBarRef.current.contains(event.target)
	) {
		setSearchResult(false);
	}
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    contextData.getUserInfo();
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  const searchForUsers = async () => {
	try {
		const res = await FetchData.get(`api/users/search/?query=${encodeURIComponent(searchQuery)}`);
		if (res.ok) {
			const data = await res.json();
			setFoundUsers(data);
		} else {
			const data = await res.json();
			authContextData.setGlobalMessage({
				message: data.error,
				isError: true,
			})
		}
	} catch (error) {
		authContextData.setGlobalMessage({
			message: error.message,
			isError: true,
		})
	}
  }

  useEffect(() => {
	if (searchQuery) {
		searchForUsers();
	} else {
		setFoundUsers([]);
	}
  }, [searchQuery])

  const handleSearch = (e) => {
	e.preventDefault();
	if (!searchQuery)
		setSearchQuery(e.target.value);
	setTimeout(() => {
		setSearchQuery(e.target.value);
	}, 500);
  }

  const handleNavigate = (user) => {
	setSearchResult(false);
	navigate(`/profile/overview/${user.username}`);
  }

  return (
    <>
      {authContextData.displayMenuGl && <Menu link={props.link} />}
      <div className="items-center w-full max-w-[1440px] z-[10000] fixed top-0 left-1/2 transform -translate-x-1/2">
        <div className="relative w-full">
          {displayOptions && (
            <OptionsSection
              data={optionsData}
              reference={optionSectionRef}
              type="options"
            />
          )}
          {displayNotification && (
            <OptionsSection reference={optionSectionRef} type="notification" />
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
            <div className="flex items-center relative lg:w-full md:w-[60%] w-full">
              <input
			  	ref={searchBarRef}
                type="text"
				onFocus={() => setSearchResult(true)}
				onChange={handleSearch}
                placeholder="find users"
                className="search-glass text-txt-sm px-32 py-8 outline-none text-white w-full"
              />
              <IoSearchOutline className="text-gray absolute left-8 text-txt-md" />
			{searchResult &&
				<>
					<div className="absolute top-[44px] bg-[url(/images/background.png)] bg-cover bg-top left-0 right-0 max-h-[300px] rounded-md">
						<ul
							ref={searchResultRef}
							className="w-full max-h-[300px] bg-black/30 backdrop-blur-xl overflow-y-scroll no-scrollbar
							rounded-md border-[0.5px] border-stroke-sc p-8 flex flex-col gap-8"
							>
								{foundUsers.length !== 0 ?
									foundUsers.map((user) => (
										<li 
											onClick={() => handleNavigate(user)}
											key={user.id}
											className="bg-gray/5 py-8 px-12 hover:bg-gray/15 overflow-hidden cursor-pointer
											transition-all rounded-md grid grid-cols-[48px,1fr] gap-12 items-center shrink-0"
											>
											<div className="w-48 h-48 rounded-full overflow-hidden flex border-[0.5px] border-stroke-sc">
												<img
													src={
														user.profile_image
														  ? `${BACKENDURL}${user.profile_image}?t=${new Date().getTime()}`
														  : "/images/default.jpeg"
													  }
													alt="img"
													className="grow object-cover"
												/>
											</div>
											<section className="flex flex-col justify-center normal-case">
												<h1 className="tracking-wider text-txt-sm font-semibold">{user.first_name} {user.last_name}</h1>
												<p className="text-txt-xs text-gray tracking-wide">@{user.username}</p>
											</section>
										</li>
										
									))
									:
									<p className="text-stroke-sc text-txt-md grow flex justify-center items-center py-8">no user founded</p>
								}
						</ul>
					</div>
				</>
			}
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
