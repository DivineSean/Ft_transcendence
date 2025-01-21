import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { BiSolidSend } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import Message from "./Message";
import { BACKENDURL } from "../../utils/fetchWrapper";
import NotifContext from "../../context/NotifContext";
import EmojiPicker from "emoji-picker-react";
import { HiOutlineFaceSmile } from "react-icons/hi2";
import UserContext from "../../context/UserContext";

const formatedDate = () => {
	const now = new Date();
	const options = { month: "short", day: "numeric" };
	const datePart = now.toLocaleDateString("en-US", options);
	const timePart = now.toLocaleTimeString("en-Us", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
	return `${datePart}, ${timePart}`;
};

const Conversation = ({ uid, hideSelf, friendInfo, displayProfile }) => {
	const navigate = useNavigate();
	const [offsetMssg, setOffsetMssg] = useState(0);
	const [isChunked, setIsChunked] = useState(false);
	const [allMessages, setAllMessages] = useState(false);
	const [chunkedData, setChunkedData] = useState(0);
	const [inputValue, setInputValue] = useState("");
	const conversation = [];
	const downScrollRef = useRef(null);
	const topScrollRef = useRef(null);
	const [oldInputValue, setOldInputValue] = useState(inputValue);

	const notifContextData = useContext(NotifContext);
	const userContextData = useContext(UserContext);

	// fetch messages in the first time we enter to the conversation
	useEffect(() => {
		if (uid) {
			setAllMessages(false);
			setChunkedData(0);
			notifContextData.getMessages(uid, setOffsetMssg);
		}
	}, [uid]);

	useEffect(() => {
		if (notifContextData.readedMessages) {
			notifContextData.messages.forEach((message) => {
				if (!message.isRead) message.isRead = true;
			});
			notifContextData.setReadedMessages(null);
		}
	}, [notifContextData.readedMessages && notifContextData.messages]);

	// check if a new message has been added and scroll down to the last message
	useEffect(() => {
		if (downScrollRef.current) {
			if (isChunked) setIsChunked(false);
			else if (!allMessages)
				downScrollRef.current.scrollIntoView({
					behavior: "smooth",
					block: "start",
					inline: "end",
				});
		}
	}, [
		notifContextData.messages.length,
		notifContextData.tempMessages.length,
		notifContextData.displayTyping,
	]);

	useEffect(() => {
		const getChunkedData = setTimeout(() => {
			if (chunkedData !== 0 && offsetMssg !== 0) {
				if (topScrollRef.current) {
					if (topScrollRef.current.scrollTop === 0)
						topScrollRef.current.scrollBy({ top: 15, behavior: "smooth" });
				}

				notifContextData.getChunkedMessages(
					uid,
					offsetMssg,
					setOffsetMssg,
					setIsChunked,
					setAllMessages,
				);
				setChunkedData(0);
			}
		}, 500);

		return () => clearTimeout(getChunkedData);
	}, [chunkedData && offsetMssg]);

	const handleConversationScroll = () => {
		if (topScrollRef.current) {
			if (topScrollRef.current.scrollTop === 0 && offsetMssg !== 0) {
				setChunkedData((prev) => prev + 1);
			}
		}
	};

	const sendMessage = (e) => {
		e.preventDefault();

		if (inputValue.trim()) {
			notifContextData.wsHook.send(
				JSON.stringify({
					message: inputValue,
					type: "message",
					convId: uid,
					userId: friendInfo.id,
					senderId: userContextData.userInfo.id,
					senderUsername: userContextData.userInfo.username,
				}),
			);
			const newMessage = {
				messageId: crypto.randomUUID(),
				isRead: false,
				isSent: false,
				convId: uid,
				isSender: true,
				message: inputValue,
				timestamp: formatedDate(),
			};
			notifContextData.setTempMessages((prevtemp) => [...prevtemp, newMessage]);
			setAllMessages(false);
		}

		e.target.reset();
		setInputValue("");
	};

	useEffect(() => {
		if (!notifContextData.isWsConnected) return;

		const sendTyping = setTimeout(() => {
			if (notifContextData.typing.length)
				// send typing because the typing state is not empty
				notifContextData.wsHook.send(
					JSON.stringify({ message: "isTyping", type: "typing", convId: uid }),
				);
			else if (!notifContextData.typing.length)
				// send stop typing because the typing state is empty
				notifContextData.wsHook.send(
					JSON.stringify({
						message: "endTyping",
						type: "stopTyping",
						convId: uid,
					}),
				);
		}, 500);

		return () => {
			clearTimeout(sendTyping);
		};
	}, [notifContextData.typing && notifContextData.typing.length]);

	useEffect(() => {
		const sendStopTyping = setTimeout(() => {
			if (oldInputValue === inputValue) {
				notifContextData.wsHook.send(
					JSON.stringify({
						message: "endTyping",
						type: "stopTyping",
						convId: uid,
					}),
				);
			}
			setOldInputValue(inputValue);
		}, 1000);

		console.log("friendInfo: ", friendInfo)
		return () => {
			clearTimeout(sendStopTyping);
		};
	});

	const handleBlur = () => {
		setTimeout(() => {
			// here when we blur the input will send stop typing
			notifContextData.wsHook.send(
				JSON.stringify({
					message: "endTyping",
					type: "stopTyping",
					convId: uid,
				}),
			);
		}, 700);
	};

	if (notifContextData.messages && notifContextData.messages.length) {
		notifContextData.messages.map((message) => {
			conversation.push(
				<Message
					friendInfo={friendInfo}
					message={message}
					key={message.messageId}
				/>,
			);
		});
	} else {
		conversation.push(
			<div
				key={0}
				className="text-stroke-sc font-light tracking-wider text-txt-xs text-center"
			>
				so messages yet! say hello!
			</div>,
		);
	}

	if (notifContextData.tempMessages && notifContextData.tempMessages.length) {
		notifContextData.tempMessages.map((message) => {
			conversation.push(
				<Message
					friendInfo={friendInfo}
					message={message}
					key={message.messageId}
				/>,
			);
		});
	}

	const goToProfileSide = () => {
		displayProfile(true);
		hideSelf(false);
	};

	const heandleIsTyping = (e) => {
		if (!notifContextData.typing) {
			notifContextData.wsHook.send(
				JSON.stringify({
					message: e.target.value,
					type: "typing",
					convId: uid,
				}),
			);
		}
		setInputValue(e.target.value);
		notifContextData.setTyping(e.target.value);
	};

	const [displayEmojiList, setDisplayEmojiList] = useState(false);

	const handleEmojiClick = (emojiObject) => {
		setInputValue((prevValue) => prevValue + emojiObject.emoji);
	};

	const emojiPickerRef = useRef(null);
	const emojisSwitch = useRef(null);

	const handleClickOutside = (event) => {
		if (
			emojiPickerRef.current &&
			!emojiPickerRef.current.contains(event.target) &&
			emojisSwitch.current &&
			!emojisSwitch.current.contains(event.target)
		) {
			setDisplayEmojiList(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			setDisplayEmojiList(false);
		};
	}, []);

	return (
		<div className={`grow md:flex flex-col gap-32 ${uid ? "flex" : "hidden"}`}>
			<div className="border-b-[0.5px] border-stroke-sc pb-16 flex justify-between items-center">
				<div className="flex gap-16 items-center">
					<IoArrowBackOutline
						onClick={() => navigate("/chat/")}
						className="md:hidden block text-txt-xl cursor-pointer"
					/>
					<div
						className={`md:w-56 md:h-56 h-48 w-48 rounded-full flex border overflow-hidden ${(friendInfo.status === "online" || friendInfo.status === "in-game") && !friendInfo.isBlocked ? "border-green" : "border-stroke-sc"}`}
					>
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
					<div className="flex flex-col justify-between h-full">
						<h2 className="md:text-h-sm-md text-h-sm-sm font-bold max-w-[200px] truncate">{`${friendInfo.first_name} ${friendInfo.last_name}`}</h2>
						{friendInfo.status !== "offline" && !friendInfo.isBlocked && (
							<p className="md:text-txt-md text-txt-xs text-green">{friendInfo.status}</p>
						)}
						{friendInfo.status === "offline" && !friendInfo.isBlocked && (
							<p className="text-txt-xs text-stroke-sc lowercase">
								last seen {friendInfo.last_login}
							</p>
						)}
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
				<div
					className={`text-center mb-[64] text-xs text-green font-light ${offsetMssg ? "block" : "hidden"}`}
				>
					loading...
				</div>
				{conversation}
				{notifContextData.displayTyping &&
					notifContextData.displayTyping.convId ===
					friendInfo.conversationId && (
						<div className="flex gap-8 items-end">
							<div className="left-message message-glass py-8 px-12 rounded-[8px] rounded-tl-[2px] max-w-[450px] text-green text-sm tracking-wider flex flex-col gap-4 ml-12 relative break-all">
								typing...
							</div>
						</div>
					)}
				<div ref={downScrollRef}></div>
			</div>
			{!friendInfo.isBlocked && (
				<div className="flex md:gap-16 gap-8 items-center relative">
					<form
						className="flex items-center grow relative"
						onSubmit={sendMessage}
					>
						<input
							onChange={heandleIsTyping}
							onBlur={handleBlur}
							value={inputValue}
							autoFocus
							type="text"
							autoComplete="off"
							placeholder="Aa..."
							name="message"
							className="send-glass text-txt-md px-16 pr-56 py-12 outline-none text-white w-full grow"
						/>
						<button
							type="submit"
							className="text-gray absolute right-16 text-txt-3xl cursor-pointer hover:text-green"
						>
							<BiSolidSend />
						</button>
					</form>
					{displayEmojiList && (
						<div
							ref={emojiPickerRef}
							className="absolute transition-all  bg-[url('/images/background.png')] bg-cover bg-center rounded-md overflow-hidden bottom-[60px] right-0"
						>
							<div className="absolute h-full w-full backdrop-blur-md"></div>
							<EmojiPicker
								emojiStyle="facebook"
								lazyLoadEmojis={true}
								searchPlaceholder="find emoji"
								theme="dark"
								hiddenEmojis={["1f3f3-fe0f-200d-1f308", "1f1ee-1f1f1"]}
								onEmojiClick={(emojiObject) => handleEmojiClick(emojiObject)}
							/>
						</div>
					)}
					<div
						ref={emojisSwitch}
						onClick={() => setDisplayEmojiList(!displayEmojiList)}
						className="secondary-glass px-8 cursor-pointer text-h-lg-lg h-full flex items-center justify-center hover:text-green"
					>
						<HiOutlineFaceSmile />
					</div>
				</div>
			)}
			{friendInfo.isBlocked && (
				<div className="cursor-not-allowed text-txt-sm text-center p-16 text-stroke-sc lowercase bg-black/20 rounded-md">
					sorry you cannot send any message because this conversation is blocked
				</div>
			)}
		</div>
	);
};

export default Conversation;
