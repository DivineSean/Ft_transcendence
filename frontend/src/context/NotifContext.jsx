import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import FetchWrapper from "../utils/fetchWrapper";

const NotifContext = createContext();

export default NotifContext;

export const NotifProvider = ({ children }) => {
  const FetchData = new FetchWrapper();

  const navigate = useNavigate();

  const authContextData = useContext(AuthContext);
  const [friendsData, setFriendsData] = useState(null);

  const getConversations = async () => {
    try {
      const res = await FetchData.get("api/chat/conversations/");
      if (res.ok) {
        const data = await res.json();
        console.log("data", data);
        setFriendsData(data);
      } else if (res.status) {
        const data = await res.json();
        if (res.status === 401) {
          authContextData.setGlobalMessage({
            message: "unauthorized user",
            isError: true,
          });
          navigate("/login");
        }
      }
    } catch (error) {
      console.error(error);
      // setGlobalMessage({message: error, isError: true});
    }
  };

  const contextData = {
    getConversations,
  };

  return (
    <NotifContext.Provider value={contextData}>
      {children}
    </NotifContext.Provider>
  );
};
