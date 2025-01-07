import { IoArrowBackOutline } from "react-icons/io5";
import { BACKENDURL } from "../../utils/fetchWrapper";
import UserLevel from "../profile/UserLevel";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import NotifContext from "../../context/NotifContext";

const ProfileOptions = ({
  uid,
  displayCoversation,
  hideSelf,
  isVisible,
  friendInfo,
}) => {
  const goToProfileSide = () => {
    displayCoversation(true);
    hideSelf(false);
  };

  const navigate = useNavigate();
  const notifContextData = useContext(NotifContext);

  return (
    <div
      className={`
				w-[300px] flex-col gap-32
				${isVisible ? "flex md:max-w-[250px] lg:max-w-[300px] w-full" : "md:flex hidden"}
			`}
    >
      <IoArrowBackOutline
        className="md:hidden block text-txt-2xl cursor-pointer"
        onClick={goToProfileSide}
      />
      <div className="flex flex-col gap-8 items-center pt-16">
        <div className="w-[104px] h-[104px] object-cover flex rounded-full overflow-hidden border-[0.5px] border-stroke-sc">
          <img
            src={
              friendInfo.profile_image
                ? BACKENDURL + friendInfo.profile_image
                : "/images/default.jpeg"
            }
            alt="profile"
            className="grow object-cover"
          />
        </div>
        <h2 className="text-h-lg-md font-bold max-w-[200px] text-center truncate">
          {friendInfo.first_name} {friendInfo.last_name}
        </h2>
        <p className="text-txt-md text-gray lowercase font-light tracking-wide max-w-[120px] truncate">
          @{friendInfo.username}
        </p>
      </div>
      {!friendInfo.isBlocked && (
        <>
          <div className="flex gap-8 justify-center">
            <button
              onClick={() =>
                notifContextData.inviteFriend(friendInfo.id, "pong", uid)
              }
              className="secondary-glass grow lg:w-full p-8 transition-all hover:bg-green/60 hover:text-black rounded-md text-green font-semibold"
            >
              invite to play
            </button>
            <button
              onClick={() =>
                navigate(`/profile/overview/${friendInfo.username}`)
              }
              className="secondary-glass grow lg:w-full p-8 transition-all hover:bg-green/60 hover:text-black rounded-md text-green font-semibold"
            >
              view profile
            </button>
          </div>
          <UserLevel
            exp={friendInfo.exp}
            level={friendInfo.level}
            percentage={friendInfo.percentage}
          />
        </>
      )}
      {!friendInfo.isBlocked && (
        <>
          <div className="h-[0.5px] bg-stroke-sc w-full"></div>
          <div className="flex flex-col gap-8">
            <h2 className="text-h-lg-sm">about</h2>
            <p className="text-txt-xs text-gray">{friendInfo.about}</p>
          </div>
        </>
      )}
      {friendInfo.isBlocked && (
        <p className="grow flex justify-center items-center text-center text-red text-txt-xs">
          you cannot see the user data while you are blocked
        </p>
      )}
    </div>
  );
};

export default ProfileOptions;
