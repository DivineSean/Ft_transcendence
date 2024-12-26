import FetchWrapper from "./fetchWrapper";

const FetchData = new FetchWrapper();

export const getConversations = async (setData, setGlobalMessage, navigate) => {
  try {
    const res = await FetchData.get("api/chat/conversations/");
    if (res.ok) {
      const data = await res.json();
      setData(data);
    } else if (res.status) {
      const data = await res.json();
      if (res.status === 401) {
        setGlobalMessage({ message: "unauthorized user", isError: true });
        navigate("/login");
      }
    }
  } catch (error) {
    // authContextData.setGlobalMessage({
    // 	message: error,
    // 	isError: true,
    // })
  }
};

export const getMessages = async (convId, setData, setOffsetMssg, navigate) => {
  try {
    const res = await FetchData.post("chat/getMessages/", {
      convID: convId,
      offset: 0,
    });

    if (res.status !== 500) {
      const data = await res.json();
      if (res.status === 200) {
        if (data.messages.length === 20) setOffsetMssg(20);
        setData(data.messages);
      } else {
        navigate("/chat");
      }
    } else {
      console.log("internal server error 500");
    }
  } catch (error) {
    // authContextData.setGlobalMessage({
    // 	message: error,
    // 	isError: true,
    // })
  }
};

export const getChunkedMessages = async (
  convId,
  setData,
  offsetMssg,
  setOfssetMssg,
  setIsChunked,
  setAllMessages,
) => {
  try {
    const res = await FetchData.post("chat/getMessages/", {
      convID: convId,
      offset: offsetMssg,
    });

    if (res.status !== 500) {
      const data = await res.json();
      if (res.status === 200) {
        setData((prevMessages) => [...data.messages, ...prevMessages]);
        if (data.next_offset === null) {
          setOfssetMssg(0);
          setAllMessages(true);
        } else {
          setOfssetMssg(data.next_offset);
          setIsChunked(true);
        }
      }
    } else {
      console.log("internal server error 500");
    }
  } catch (error) {
    // authContextData.setGlobalMessage({
    // 	message: error,
    // 	isError: true,
    // })
  }
};
