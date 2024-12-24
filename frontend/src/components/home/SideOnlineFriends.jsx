import { BACKENDURL } from "../../utils/fetchWrapper";
import { useNavigate } from "react-router-dom";

const SideOnlineFriends = ({ ...props }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/profile/overview/${props.friend.username}`)}
      className="relative p-4 text-gray cursor-pointer"
      key={props.key}
    >
      <div
        className={`w-56 h-56 rounded-full flex overflow-hidden border-2 ${props.friend.isOnline ? "border-green" : "border-gray"} `}
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
      <div
        className={`
						${props.friend.isOnline ? "bg-green" : "bg-black border-[3px] border-gray"}
						w-16 h-16 rounded-full absolute bottom-4 right-4
					`}
      ></div>
    </div>
  );
};
export default SideOnlineFriends;
