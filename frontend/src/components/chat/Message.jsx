import { IoCheckmarkDone } from "react-icons/io5";
import { MdOutlineRunningWithErrors } from "react-icons/md";

// side={message.isSender ? 'right' : 'left'}
// message={message.message}
// timestamp={message.timestamp}
// isRead={message.isRead}

const Message = ({ message }) => {
  const side = message.isSender ? "right" : "left";

  if (side === "right") {
    return (
      <div className="flex gap-8 items-end">
        <div className="grow"></div>
        <div className="right-message message-glass py-8 px-12 rounded-[8px] rounded-tr-[2px] max-w-[450px] text-gray text-txt-md tracking-wider flex flex-col gap-4 mr-12 relative break-words">
          {message.message}
          <div className="flex gap-4 items-center justify-end">
            <p className="text-xs text-stroke-sc">{message.timestamp}</p>
            {message.isSent && (
              <IoCheckmarkDone
                className={`text-txt-sm ${message.isRead ? "text-green" : "text-stroke-sc"}`}
              />
            )}
            {!message.isSent && (
              <MdOutlineRunningWithErrors className={`text-txt-sm text-red`} />
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex gap-8 items-end">
        <div className="left-message message-glass py-8 px-12 rounded-[8px] rounded-tl-[2px] max-w-[450px] text-gray text-txt-md tracking-wider flex flex-col gap-4 ml-12 relative break-words">
          {message.message}
          <div className="flex gap-4 items-center justify-end">
            <p className="text-xs text-stroke-sc">{message.timestamp}</p>
          </div>
        </div>
      </div>
    );
  }
};

/*
	<div className="message-glass p-16 rounded-lg border-[0.5px] border-stroke-pr flex flex-col gap-8 items-center">
		<p>a new pong game invite send</p>
		<button className="secondary-glass p-8 px-16 transition-all hover:bg-green/60 hover:text-black rounded-md text-green font-semibold">
			accept
		</button>
		<button
			disabled
			className="secondary-glass p-8 px-16 transition-all hover:bg-green/60 hover:text-black rounded-md
			text-green font-semibold disabled:text-stroke-sc disabled:bg-transparent disabled:cursor-not-allowed"
		>
			accept
		</button>
	</div>
*/

export default Message;
