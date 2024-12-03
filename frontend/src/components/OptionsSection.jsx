import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { useRef } from "react";
import { BACKENDURL } from "../utils/fetchWrapper";

const OptionsSection = ({ data, type, reference, contextData}) => {
  const sectionRef = useRef([]);
  const { logout } = useContext(AuthContext);
	const navigate = useNavigate();

  const handleClick = (index) => {
    const clickedItem = sectionRef.current[index];
    if (clickedItem.textContent === "logout") {
      logout();
    }
  };

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
					options-glass p-8 z-[1000] overflow-y-scroll no-scrollbar
					absolute flex-col gap-16 top-64 max-h-[300px] rounded-md
					${type === "options" && "lg:flex hidden lg:right-32 w-[250px]"}
					${type === "notification" && "flex lg:right-[90px] right-56 w-[300px]"}
				`}
      >
        {type === "notification" && (
          <h2 className="font-bold p-8 tracking-wide text-h-dm-md">
            Notifications
          </h2>
        )}
        {type === "options" && (
          <div
            // to="/profile/overview"
						onClick={() => {
							contextData.setProfileInfo(contextData.userInfo);
							navigate('/profile/overview');
						}}
            className="flex gap-16 p-8 cursor-pointer hover-secondary rounded items-center"
          >
            <div className="bg-gray w-32 h-32 rounded-full lg:block hidden overflow-hidden cursor-pointer">
              <img
                src={
									contextData.userInfo && contextData.userInfo.profile_image
									? BACKENDURL + contextData.userInfo.profile_image
									: "/images/default.jpeg"
								}
                alt="profile pic"
                className="w-full"
              />
            </div>
            <h2 className="text-h-sm-sm tracking-wide lowercase">{contextData.userInfo && contextData.userInfo.username}</h2>
          </div>
        )}
        <ul className="w-full flex flex-col gap-8">
          {data.map((section, i) => (
            <li
              key={i}
              ref={(el) => (sectionRef.current[i] = el)}
              onClick={() => handleClick(i)}
              className={`
									cursor-pointer p-8 w-full rounded flex gap-16 items-center
									${type === "options" && "text-txt-sm"}
									${type === "options" && section.name !== "logout" && "hover:hover-secondary"}
									${type === "notification" && "text-txt-xs justify-start hover:hover-secondary"}
									${section.name === "logout" && "hover:bg-logout-bg"}
								`}
            >
              {type === "options" && (
                <>
                  {section.icon}
                  {section.name}
                </>
              )}
              {type === "notification" && section}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default OptionsSection;
