const SideOnlineFriends = ({ ...props }) => {
  if (props.isOnline || props.isSend) {
    if (props.messageNumber > 99) props.messageNumber = "+99";
    return (
      <div className="relative p-4 text-gray" key={props.key}>
        {props.isOnline && (
          <div className="w-56 h-56 rounded-full overflow-hidden border-2 border-green">
            <img src="images/profile.png" alt="profile" />
          </div>
        )}
        {!props.isOnline && (
          <div className="w-56 h-56 rounded-full overflow-hidden border-2 border-gray">
            <img src="images/profile.png" alt="profile" />
          </div>
        )}
        {props.isSend && (
          <div className="min-w-24 bg-red rounded-full absolute top-0 left-0 text-center">
            <p className="text-txt-md">{props.messageNumber}</p>
          </div>
        )}
        {props.isOnline && (
          <div className="w-16 h-16 bg-green rounded-full absolute bottom-4 right-4"></div>
        )}
        {!props.isOnline && (
          <div className="bg-black border-[3px] border-gray w-16 h-16 rounded-full absolute bottom-4 right-4"></div>
        )}
      </div>
    );
  }
};
export default SideOnlineFriends;
