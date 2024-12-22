import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { BiSolidSend } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { getChunkedMessages, getMessages } from "../../utils/chatFetchData";
import { useContext, useEffect, useRef, useState } from "react";
import Message from "./Message";
import { BACKENDURL } from "../../utils/fetchWrapper";
import NotifContext from "../../context/NotifContext";

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

const Conversation = ({
  uid,
  typing,
  hideSelf,
  messages,
  setTyping,
  friendInfo,
  setMessages,
  tempMessages,
  displayTyping,
  readedMessages,
  displayProfile,
  setTempMessages,
  setReadedMessages,
}) => {
  const navigate = useNavigate();
  const [offsetMssg, setOffsetMssg] = useState(0);
  const [isChunked, setIsChunked] = useState(false);
  const [allMessages, setAllMessages] = useState(false);
  const [chunkedData, setChunkedData] = useState(0);
  const conversation = [];
  const downScrollRef = useRef(null);
  const topScrollRef = useRef(null);

  const notifContextData = useContext(NotifContext);

  // fetch messages in the first time we enter to the conversation
  useEffect(() => {
    if (uid) {
      setAllMessages(false);
      setChunkedData(0);
      getMessages(uid, setMessages, setOffsetMssg);
    }
  }, [uid]);

  useEffect(() => {
    if (readedMessages) {
      messages.forEach((message) => {
        if (!message.isRead) message.isRead = true;
      });
      setReadedMessages(null);
    }
  }, [readedMessages && messages]);

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
  }, [messages.length, tempMessages.length, displayTyping]);

  useEffect(() => {
    const getChunkedData = setTimeout(() => {
      if (chunkedData !== 0 && offsetMssg !== 0) {
        if (topScrollRef.current) {
          if (topScrollRef.current.scrollTop === 0)
            topScrollRef.current.scrollBy({ top: 15, behavior: "smooth" });
        }
        getChunkedMessages(
          uid,
          setMessages,
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

  // send a message into a ws
  const sendMessage = (e) => {
    e.preventDefault();

    if (notifContextData.ws.current && e.target.message.value.trim()) {
      notifContextData.ws.current.send(
        JSON.stringify({
          message: e.target.message.value,
          type: "message",
          convId: uid,
        }),
      );
      const newMessage = {
        messageId: crypto.randomUUID(),
        isRead: false,
        isSent: false,
        convId: uid,
        isSender: true,
        message: e.target.message.value,
        timestamp: formatedDate(),
      };
      setTempMessages((prevtemp) => [...prevtemp, newMessage]);
      setAllMessages(false);
    }
    e.target.reset();
  };

  // send typing into a ws
  useEffect(() => {
    if (!notifContextData.isWsConnected) return;

    const sendTyping = setTimeout(() => {
      if (notifContextData.ws.current && typing.length)
        // send typing because the typing state is not empty
        notifContextData.ws.current.send(
          JSON.stringify({ message: "isTyping", type: "typing", convId: uid }),
        );
      else if (notifContextData.ws.current && !typing.length)
        // send stop typing because the typing state is empty
        notifContextData.ws.current.send(
          JSON.stringify({
            message: "endTyping",
            type: "stopTyping",
            convId: uid,
          }),
        );
    }, 500);

    return () => clearTimeout(sendTyping);
  }, [typing && typing.length]);

  const handleBlur = () => {
    setTimeout(() => {
      if (notifContextData.ws.current)
        // here when we blur the input will send stop typing
        notifContextData.ws.current.send(
          JSON.stringify({
            message: "endTyping",
            type: "stopTyping",
            convId: uid,
          }),
        );
    }, 700);
  };

  if (messages && messages.length) {
    messages.map((message) => {
      conversation.push(<Message message={message} key={message.messageId} />);
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

  if (tempMessages && tempMessages.length) {
    tempMessages.map((message) => {
      conversation.push(<Message message={message} key={message.messageId} />);
    });
  }

  const goToProfileSide = () => {
    displayProfile(true);
    hideSelf(false);
  };

  const heandleIsTyping = (e) => {
    if (!typing) {
      if (notifContextData.ws.current)
        notifContextData.ws.current.send(
          JSON.stringify({
            message: e.target.value,
            type: "typing",
            convId: uid,
          }),
        );
    }
    setTyping(e.target.value);
  };

  return (
    <div className={`grow md:flex flex-col gap-32 ${uid ? "flex" : "hidden"}`}>
      <div className="border-b-[0.5px] border-stroke-sc pb-16 flex justify-between items-center">
        <div className="flex gap-16 items-center">
          <IoArrowBackOutline
            onClick={() => navigate("/chat/")}
            className="md:hidden block text-txt-xl cursor-pointer"
          />
          <div
            className={`md:w-56 md:h-56 h-48 w-48 rounded-full flex border overflow-hidden ${friendInfo.isOnline ? "border-green" : "border-stroke-sc"}`}
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
            <h2 className="md:text-h-sm-md text-h-sm-sm font-bold">{`${friendInfo.first_name} ${friendInfo.last_name}`}</h2>
            {friendInfo.isOnline && (
              <p className="md:text-txt-md text-txt-xs text-green">online</p>
            )}
            {!friendInfo.isOnline && (
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
        {displayTyping &&
          displayTyping.convId === friendInfo.conversationId && (
            <div className="flex gap-8 items-end">
              <div className="left-message message-glass py-8 px-12 rounded-[8px] rounded-tl-[2px] max-w-[450px] text-green text-sm tracking-wider flex flex-col gap-4 ml-12 relative break-all">
                typing...
              </div>
            </div>
          )}
        <div ref={downScrollRef}></div>
      </div>
      {!friendInfo.isBlocked && (
        <form className="flex items-center relative" onSubmit={sendMessage}>
          <input
            onChange={heandleIsTyping}
            onBlur={handleBlur}
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
      )}
      {friendInfo.isBlocked && (
        <div className="cursor-not-allowed text-txt-sm text-center p-16 text-stroke-sc lowercase bg-black/20 rounded-md">
          sorry you cannot send any message because this conversatoin is blocked
        </div>
      )}
    </div>
  );
};

export default Conversation;
