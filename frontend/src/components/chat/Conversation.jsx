import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { BiSolidSend } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { getMessages, sendMessage } from "../../utils/chatFetchData";
import { IoCheckmarkDone } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";


const Message = ({...props}) => {

	if (props.side === 'right') {
		return (
			<div className="flex gap-8 items-end">
				<div className="grow"></div>
				<div className="right-message message-glass py-8 px-12 rounded-[8px] rounded-tr-[2px] max-w-[450px] text-gray text-sm tracking-wider flex flex-col gap-8 mr-12 relative">
					{props.message}
					<div className="flex gap-4 items-center justify-end">
						<p className="text-xs text-stroke-sc" >18:40</p>
						<IoCheckmarkDone className="text-txt-sm text-green"/>
					</div>
				</div>
			</div>
		)

	} else {
		
		return (
			<div className="flex gap-8 items-end">
				<div className="left-message message-glass py-8 px-12 rounded-[8px] rounded-tl-[2px] max-w-[450px] text-gray text-sm tracking-wider flex flex-col gap-8 ml-12 relative">
					{props.message}
					<div className="flex gap-4 items-center justify-end">
						<p className="text-xs text-stroke-sc" >18:40</p>
					</div>
				</div>
			</div>
		)

	}
}

const Conversation = ({uid, displayProfile, hideSelf, friendInfo}) => {

	const navigate = useNavigate();
	const [messages, setMessages] = useState(null);
	const [sendMessageState, setSendMessageState] = useState(false);
	const conversation = [];
	const downScrollRef = useRef(null);
	const topScrollRef = useRef(null);

	if (downScrollRef.current) // auto scroll down to the last message int he conversation
		downScrollRef.current.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'end'});

	useEffect(() => {
		getMessages(friendInfo.conversationId, setMessages);
		if (sendMessageState)
			setSendMessageState(false);
	}, [friendInfo.conversationId, sendMessageState]);
	

	if (messages && messages.length) {
		messages.map(message => {
			conversation.push(
				<Message
					key={message.messageId}
					side={message.isSender ? 'right' : 'left'}
					message={message.message}
				/>
			)
		})
	} else {
		conversation.push(<div className="text-stroke-sc font-light tracking-wider text-txt-xs text-center" >so messages yet! say hello!</div>)
	}

	const sendMessageHandler = (e) => {
		e.preventDefault();
		sendMessage(friendInfo.conversationId, e.target.message.value, setSendMessageState);
		e.target.reset();
	}

	const goToProfileSide = () => {
		displayProfile(true);
		hideSelf(false);
	}

	return (
		<div
			className={`
				grow md:flex flex-col gap-32
				${uid ? 'flex' : 'hidden'}
			`}
		>
			<div className="border-b-[0.5px] border-stroke-sc pb-16 flex justify-between items-center">
				<div className="flex gap-16 items-center">
					<IoArrowBackOutline onClick={() => navigate('/chat/')} className="md:hidden block text-txt-xl cursor-pointer"/>
					<div className={`md:w-56 md:h-56 h-48 w-48 rounded-full border overflow-hidden ${friendInfo.isOnline ? 'border-green' : 'border-stroke-sc'}`}>
						<img src="/images/profile.png" alt="profile" />
					</div>
					<div className="flex flex-col justify-between h-full">
						<h2 className="md:text-h-sm-md text-h-sm-sm font-bold">{`${friendInfo.firstName} ${friendInfo.lastName}`}</h2>
						{friendInfo.isOnline &&
							<p className="md:text-txt-md text-txt-xs text-green">online</p>
						}
						{!friendInfo.isOnline &&
							<p className="text-txt-xs text-stroke-sc lowercase">last seen {friendInfo.lastLogin}</p>
						}
					</div>
				</div>
				<IoIosInformationCircleOutline
					className="md:hidden block text-txt-2xl cursor-pointer"
					onClick={goToProfileSide}
				/>
			</div>
			<div className="h-14 flex grow flex-col gap-16 overflow-y-scroll no-scrollbar">
				<div ref={topScrollRef}></div>
				{conversation}
				<div ref={downScrollRef}></div>
			</div>
			<form className="flex items-center relative" onSubmit={sendMessageHandler}>
				<input type="text" placeholder='Aa...' name="message" className='send-glass text-txt-md px-16 pr-56 py-12 outline-none text-white w-full grow'/>
				<button type="submit" className='text-gray absolute right-16 text-txt-3xl cursor-pointer hover:text-green'>
					<BiSolidSend/>
				</button>
			</form>	
		</div>
	)
}

export default Conversation;