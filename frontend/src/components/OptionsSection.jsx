import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { useRef } from "react";

const OptionsSection = ({ data, type, reference }) => {
  const sectionRef = useRef([]);
  const { logout } = useContext(AuthContext);

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
          <Link
            to="/profile/overview"
            className="flex gap-16 p-8 cursor-pointer hover-secondary rounded items-center"
          >
            <div className="bg-gray w-32 h-32 rounded-full lg:block hidden overflow-hidden cursor-pointer">
              <img
                src="/images/profile.png"
                alt="profile pic"
                className="w-full"
              />
            </div>
            <h2 className="text-h-sm-md tracking-wide">si mohammed</h2>
          </Link>
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
