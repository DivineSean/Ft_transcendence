import { IoChatbubbleEllipsesOutline, IoChevronBack } from "react-icons/io5";
import AuthContext from "../context/AuthContext";
import { RiGamepadLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import { PiRanking } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { GoHome } from "react-icons/go";
import { useContext } from "react";
import UserContext from "../context/UserContext";
import { BACKENDURL } from "../utils/fetchWrapper";
import { TbTournament } from "react-icons/tb";

const navLinks = [
  {
    name: "home",
    icon: <GoHome />,
  },
  {
    name: "profile",
    icon: <FaRegUser />,
  },
  {
    name: "chat",
    icon: <IoChatbubbleEllipsesOutline />,
  },
  {
    name: "games",
    icon: <RiGamepadLine />,
  },
  {
    name: "tournaments",
    icon: <TbTournament />,
  },
  {
    name: "rankings",
    icon: <PiRanking />,
  },
  //   {
  //     name: "explore",
  //     icon: <MdOutlineExplore />,
  //   },
];

const Menu = ({ ...props }) => {
  const { displayMenuGl, setDisplayMenuGl, logout } = useContext(AuthContext);
  const userContextData = useContext(UserContext);
  const navigate = useNavigate();

  const navigateToPage = (link) => {
    if (link.name === "profile") navigate(`/profile/overview`);
    else navigate(`/${link.name}`);
    setDisplayMenuGl(false);
  };
  const links = [];
  navLinks.forEach((link) => {
    if (props.link === link.name) {
      links.push(
        <div
          onClick={() => navigateToPage(link)}
          key={link.name}
          className="font-semibold hover-secondary rounded-md"
        >
          <li className="p-16 flex items-center gap-16 text-h-sm-sm" key={link}>
            {link.icon}
            {link.name}
          </li>
        </div>,
      );
    } else {
      links.push(
        <div
          onClick={() => navigateToPage(link)}
          key={link.name}
          className="hover:hover-secondary rounded-md font-semibold"
        >
          <li className="p-16 flex items-center gap-16 text-h-sm-sm" key={link}>
            {link.icon}
            {link.name}
          </li>
        </div>,
      );
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1100) {
      setDisplayMenuGl(false);
    }
  });

  const toggleDisplay = () => {
    setDisplayMenuGl(!displayMenuGl);
  };

  return (
    <div className="fixed bg-[url('/images/background.png')] bg-cover bg-center max-h-screen p-16 text-white gap-32 overflow-y-scroll no-scrollbar lg:hidden flex flex-col absolute z-[100] right-0 left-0 bottom-0 top-0">
      <div className="absolute primary-glass-no-rounded w-full h-full top-0 left-0 z-[-1]"></div>
      <div className="flex px-16 py-8 justify-between secondary-glass items-center ">
        <div className="flex gap-16 overflow-hidden">
          <div className="w-64 h-64 bg-gray flex rounded-full overflow-hidden border-[0.5px] border-stroke-sc">
            <img
              src={
                userContextData.userInfo.profile_image
                  ? `${BACKENDURL}${userContextData.userInfo.profile_image}`
                  : "/images/default.jpeg"
              }
              alt="profile"
              className="grow object-cover pointer-events-none"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-h-sm-sm font-semibold">
              {userContextData.userInfo.first_name}{" "}
              {userContextData.userInfo.last_name}
            </h2>
            <p className="text-txt-xs lowercase">
              @{userContextData.userInfo.username}
            </p>
          </div>
        </div>
        <IoChevronBack
          onClick={toggleDisplay}
          className="text-txt-3xl cursor-pointer"
        />
      </div>
      <ul className="flex flex-col gap-8">{links}</ul>
      <div className="grow md:block hidden"></div>
      <div
        onClick={logout}
        className="menu-linkes flex p-16 gap-16 text-h-sm-sm rounded-md items-center hover:bg-logout-bg cursor-pointer"
      >
        <TbLogout2 />
        logout
      </div>
    </div>
  );
};

export default Menu;
