import { IoCheckmarkDone } from "react-icons/io5";

const Message = ({...props}) => {
	if (props.side === 'right') {
		return (
			<div className="flex gap-8 items-end">
				<div className="grow"></div>
				<div className="right-message message-glass py-8 px-12 rounded-[8px] rounded-tr-[2px] max-w-[450px] text-gray text-sm tracking-wider flex flex-col gap-4 mr-12 relative break-all">
					{props.message}
					<div className="flex gap-4 items-center justify-end">
						<p className="text-xs text-stroke-sc" >{props.timestamp}</p>
						<IoCheckmarkDone className={`text-txt-sm ${props.isRead ? 'text-green' : 'text-stroke-sc'}`}/>
					</div>
				</div>
			</div>
		)
	} else {
		return (
			<div className="flex gap-8 items-end">
				<div className="left-message message-glass py-8 px-12 rounded-[8px] rounded-tl-[2px] max-w-[450px] text-gray text-sm tracking-wider flex flex-col gap-4 ml-12 relative break-all">
					{props.message}
					<div className="flex gap-4 items-center justify-end">
						<p className="text-xs text-stroke-sc" >{props.timestamp}</p>
					</div>
				</div>
			</div>
		)
	}
}

export default Message;