import { BACKENDURL } from "../../utils/fetchWrapper";
import { useNavigate } from "react-router-dom";
import { TbDeviceGamepad3Filled } from "react-icons/tb";

const SideOnlineFriends = ({ ...props }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/profile/overview/${props.friend.username}`)}
      className="relative p-4 text-gray cursor-pointer"
      key={props.key}
    >
      <div
        className={`w-56 h-56 rounded-full flex overflow-hidden border-2 ${(props.friend.status === 'online' || props.friend.status === 'in-game') ? "border-green" : "border-gray"} `}
      >
        <img
          src={
            props.friend.profile_image
              ? `${BACKENDURL}${props.friend.profile_image}?t=${new Date().getTime()}`
              : "/images/default.jpeg"
          }
          alt="profile"
          className="object-cover grow pointer-events-none"
        />
      </div>
      {props.isSend && (
        <div className="min-w-24 bg-red rounded-full absolute top-0 left-0 text-center">
          <p className="text-txt-md">{props.messageNumber}</p>
        </div>
      )}
			{props.friend.status !== 'in-game' &&
				<div
					className={`
							${props.friend.status === 'online' ? "bg-green" : "bg-black border-[3px] border-gray"}
							w-16 h-16 rounded-full absolute bottom-4 right-4
						`}
				></div>
			}
			{props.friend.status === 'in-game' &&
				<div className={`absolute rounded-full flex items-center justify-center -right-2 bottom-0 p-2 bg-black/80 border border-green`}>
					<TbDeviceGamepad3Filled className="text-green" />
				</div>
			}
    </div>
  );
};
export default SideOnlineFriends;
