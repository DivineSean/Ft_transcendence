import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { BiSolidSend } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { getChunkedMessages, getMessages } from "../../utils/chatFetchData";
import { useEffect, useRef, useState } from "react";
import Message from "./Message";

const Conversation = ({uid, displayProfile, hideSelf, friendInfo, ws, messages, setMessages, readedMessages, setReadedMessages}) => {
	const navigate = useNavigate();
	const [offsetMssg, setOffsetMssg] = useState(0);
	const [isChunked, setIsChunked] = useState(false);
	const [allMessages, setAllMessages] = useState(false);
	const conversation = [];
	const downScrollRef = useRef(null);
	const topScrollRef = useRef(null);
	
	// fetch messages in the first time we enter to the conversation
	useEffect(() => {
		if (uid)
			getMessages(uid, setMessages, setOffsetMssg);
	}, [uid]);

	useEffect(() => {
		if (readedMessages) {
			messages.forEach(message => {
				if (!message.isRead)
					message.isRead = true;
			})
			setReadedMessages(null);
		}
	}, [readedMessages && messages]);

	// check if a new message has been added and scroll down to the last message
	useEffect(() => {

		if (downScrollRef.current) {
			if (isChunked)
				setIsChunked(false);
			else if (!allMessages)
				downScrollRef.current.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'end'});
		}

	}, [messages.length]);

	const handleConversationScroll = () => {

		if (topScrollRef.current) {
			if (topScrollRef.current.scrollTop === 0 && offsetMssg !== 0) {
				topScrollRef.current.scrollBy({top: 15, behavior: 'smooth'});
				getChunkedMessages(uid, setMessages, offsetMssg, setOffsetMssg, setIsChunked, setAllMessages);
			}
		}

	};

	// send a message into a ws
	const sendMessage = (e) => {
		e.preventDefault();
		
		if (ws.current && e.target.message.value.trim()) {
			ws.current.send(JSON.stringify({'message': e.target.message.value, 'type': 'message', 'convId': uid}))
			setAllMessages(false);
		}
		e.target.reset();
	};

	if (messages && messages.length) {
		messages.map(message => {
			conversation.push(
				<Message message={message} key={message.messageId} />
			)
		})
	} else {
		conversation.push(<div key={0} className="text-stroke-sc font-light tracking-wider text-txt-xs text-center" >so messages yet! say hello!</div>)
	}

	const goToProfileSide = () => {
		displayProfile(true);
		hideSelf(false);
	};

	return (
		<div className={`grow md:flex flex-col gap-32 ${uid ? 'flex' : 'hidden'}`}>
			<div className="border-b-[0.5px] border-stroke-sc pb-16 flex justify-between items-center">
				<div className="flex gap-16 items-center">
					<IoArrowBackOutline
						onClick={() => navigate('/chat/')}
						className="md:hidden block text-txt-xl cursor-pointer"
					/>
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
			<div
				ref={topScrollRef}
				onScroll={handleConversationScroll}
				className="h-4 flex grow flex-col gap-16 overflow-y-scroll no-scrollbar normal-case"
			>
				<div className={`text-center mb-[64] text-xs text-stroke-sc ${offsetMssg ? 'block' : 'hidden'}`}>loading...</div>
				{conversation}
				<div ref={downScrollRef}></div>
			</div>
			<form className="flex items-center relative" onSubmit={sendMessage}>
				<input
					autoFocus
					type="text"
					autoComplete="off"
					placeholder='Aa...'
					name="message"
					className='send-glass text-txt-md px-16 pr-56 py-12 outline-none text-white w-full grow'
				/>
				<button
					type="submit"
					className='text-gray absolute right-16 text-txt-3xl cursor-pointer hover:text-green'
				>
					<BiSolidSend/>
				</button>
			</form>	
		</div>
	)
}

export default Conversation;