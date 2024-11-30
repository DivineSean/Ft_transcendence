import {
  IoShieldOutline,
  IoGameControllerOutline,
  IoArrowBackOutline,
} from "react-icons/io5";
import { TbDiamond, TbPingPong } from "react-icons/tb";
import { BACKENDURL } from "../../utils/fetchWrapper";

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
      <div className="flex flex-col gap-8 items-center">
        <div className="w-[104px] h-[104px] object-cover flex rounded-full overflow-hidden border-[0.5px] border-stroke-sc">
          <img src={friendInfo.profile_image ? BACKENDURL + friendInfo.profile_image : '/images/default.jpeg'} alt="p" />
        </div>
        <h2 className="text-h-lg-md font-bold max-w-[200px] text-center">
          {friendInfo.first_name} {friendInfo.last_name}
        </h2>
        <p className="text-txt-md text-gray lowercase font-light tracking-wide">
          @{friendInfo.username}
        </p>
        <button className="bg-green text-black rounded px-12 py-4">
          invite to play
        </button>
      </div>
      <div className="flex flex-col gap-16 items-center">
        <div className="flex gap-16">
          <div className="p-8 flex gap-8 border border-stroke-sc rounded-[8px]">
            <TbDiamond className="text-green text-txt-2xl" />
            <p className="text-txt-md text-gray">14.35</p>
          </div>
          <div className="p-8 flex gap-8 border border-stroke-sc rounded-[8px]">
            <TbPingPong className="text-green text-txt-2xl" />
            <p className="text-txt-md text-gray">5</p>
          </div>
        </div>
        <div className="flex gap-16">
          <div className="p-8 flex gap-8 border border-stroke-sc rounded-[8px]">
            <IoShieldOutline className="text-green text-txt-2xl" />
            <p className="text-txt-md text-gray">10</p>
          </div>
          <div className="p-8 flex gap-8 border border-stroke-sc rounded-[8px]">
            <IoGameControllerOutline className="text-green text-txt-2xl" />
            <p className="text-txt-md text-gray">14.03</p>
          </div>
        </div>
      </div>
      <div className="h-[0.5px] bg-stroke-sc w-full"></div>
      <div className="flex flex-col gap-8">
        <h2 className="text-h-lg-sm">about</h2>
        <p className="text-txt-xs text-gray">{friendInfo.about}</p>
      </div>
    </div>
  );
};

export default ProfileOptions;
