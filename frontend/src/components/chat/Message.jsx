import { IoCheckmarkDone } from "react-icons/io5";
import { MdOutlineRunningWithErrors } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// side={message.isSender ? 'right' : 'left'}
// message={message.message}
// timestamp={message.timestamp}
// isRead={message.isRead}

const Message = ({ message, friendInfo }) => {
  const side = message.isSender ? "right" : "left";
	const navigate = useNavigate();

  if (side === "right") {
    return (
			<>
				{!message.metadata ?
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
					:
					<div className="flex gap-8 items-end">
						<div className="grow"></div>
						<div className="message-glass py-8 px-12 border-[0.5px] border-green/40 rounded-tr-0 rounded-b-lg rounded-l-lg max-w-[450px] w-full text-gray text-txt-md tracking-wider flex flex-col gap-4 mr-12 relative break-words">
							<div className="p-16 rounded-lg flex flex-col gap-16 w-full">
								<p>
									you invite @{friendInfo.username} to play {message.metadata.game} game
								</p>
								<button
									disabled={message.metadata.status !== "waiting"}
									onClick={() => navigate(`/games/${message.metadata.game}/online/${message.metadata.gameRoomId}`)}
									className="hover-secondary border border-gray/20 p-8 px-16 transition-all hover:bg-green/60
										hover:text-black rounded-md text-green font-semibold disabled:text-stroke-sc disabled:bg-transparent
										disabled:cursor-not-allowed"
								>
									{message.metadata.status === "waiting" ?
										'play game'
										:
										'invite expired'
									}
								</button>
							</div>
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
				}
			</>
    );
  } else {
    return (
			<>
				{!message.metadata ?
					<div className="flex gap-8 items-end">
						<div className="left-message message-glass py-8 px-12 rounded-[8px] rounded-tl-[2px] max-w-[450px] text-gray text-txt-md tracking-wider flex flex-col gap-4 ml-12 relative break-words">
							{message.message}
							<div className="flex gap-4 items-center justify-end">
								<p className="text-xs text-stroke-sc">{message.timestamp}</p>
							</div>
						</div>
					</div>
					:
					<div className="flex gap-8 items-end">
						<div className="message-glass py-8 px-12 border-[0.5px] border-green/40 rounded-r-lg rounded-b-lg rounded-tl-0 max-w-[450px] ml-12 w-full text-gray text-txt-md tracking-wider flex flex-col gap-4 mr-12 relative break-words">
							<div className="p-16 rounded-lg flex flex-col gap-16 w-full">
									<p>you get invited by <span className="font-semibold">@{friendInfo.username}</span> to play {message.metadata.game} game</p>
									<button
										disabled={message.metadata.status !== "waiting"}
										onClick={() => navigate(`/games/${message.metadata.game}/online/${message.metadata.gameRoomId}`)}
										className="hover-secondary border border-gray/20 p-8 px-16 transition-all hover:bg-green/60
											hover:text-black rounded-md text-green font-semibold disabled:text-stroke-sc disabled:bg-transparent
											disabled:cursor-not-allowed"
									>
										{message.metadata.status === "waiting" ?
											'play game'
											:
											'invite expired'
										}
									</button>
								</div>
							<div className="flex gap-4 items-center justify-end">
								<p className="text-xs text-stroke-sc">{message.timestamp}</p>
							</div>
						</div>
					</div>
				}
			</>
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
