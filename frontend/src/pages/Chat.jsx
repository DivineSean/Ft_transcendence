import ProfileOptions from "../components/chat/ProfileOptions";
import Conversation from "../components/chat/Conversation";
import ChatFriends from "../components/chat/ChatFriends";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";

const Chat = () => {
	const { uid } = useParams();
	const [profileSide, setProfileSide] = useState(window.innerWidth <= 768 ? false : true);
	const [conversationSide, setConversationSide] = useState(true);
	console.log('before', profileSide);
	window.addEventListener('resize', () => {
		if (!conversationSide)
			setConversationSide(true);
		if (window.innerWidth < 768)
			setProfileSide(false);
		if (window.innerWidth >= 768)
			setProfileSide(true);
	})
	console.log('after', profileSide);
	return (
		<div className="flex flex-col grow">
		<Header link='chat' />
		<div className="container md:px-16 px-0">
			<div className="backdrop-blur-sm w-full h-full absolute top-0 right-0"></div>
			<div className="primary-glass p-16 flex gap-16 grow">
				<ChatFriends uid={uid} />
				<div className="w-[0.5px] bg-stroke-sc md:block hidden"></div>
				{uid &&
					<>
						{conversationSide &&
							<Conversation
								uid={uid}
								displayProfile={setProfileSide}
								hideSelf={setConversationSide}
							/>
						}
						<div className="w-[0.5px] bg-stroke-sc md:block hidden"></div>
						{profileSide &&
							<ProfileOptions
								uid={uid}
								displayCoversation={setConversationSide}
								hideSelf={setProfileSide}
								isVisible={profileSide}
							/>
						}
					</>
				}
				{!uid && 
					<div className="grow md:flex hidden flex-col gap-16 justify-center items-center text-gray">
						<div className="contrast-75 grayscale-[50%] w-[300px] h-[300px] bg-[url('/images/chat.png')] bg-cover bg-center"></div>
						<p className="w-[300px] font-light tracking-wider text-center text-txt-sm">Send and receive messanges with your friends freely and securely.</p>
					</div>
				}
			</div>
		</div>
		</div>
	)
}

export default Chat;