import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import FetchWrapper from "../utils/fetchWrapper";

const NotifContext = createContext();

export default NotifContext;

export const NotifProvider = ({ children }) => {
  const FetchData = new FetchWrapper();
  const navigate = useNavigate();
	const ws = useRef(null);
	const [friendRequest, setFriendRequest] = useState(false);
	const [notifData, setNotifData] = useState(null);

  const authContextData = useContext(AuthContext);
	const [isWsConnected, setIsWsConnected] = useState(false);

	useEffect(() => {
    ws.current = new WebSocket(
      `wss://${window.location.hostname}:8000/ws/chat/`,
    );
    // console.log('from chat ws');
    // console.log('ws: ', ws.current);

    ws.current.onopen = () => {
      // overide the onopen event
      console.log("Connected");
      // here we set this state to true to make sure
      // that the socket is connected successfully when we want to send an event
      setIsWsConnected(true);
    };

    ws.current.onclose = () => console.log("Disconnected"); // override the onclose event

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, []);

	// 95dd4cde-86ff-40e5-906d-32c412ee543a
	// 6434d48a-161e-4e0f-af68-f83700a37053
	if (ws.current) {
		ws.current.onmessage = (e) => {
			const socketData = JSON.parse(e.data);
			if (socketData) {
				console.log('chihaja tbedlat', socketData);
				console.log('type', socketData.type);
				console.log('message', socketData.message);
			}
		}
	}

	const getNotfications = async () => {
		try {
			const res = await FetchData.get('api/notification/');
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				setNotifData(data);
				// console.log(data);
			}
		} catch (error) {
			console.log('get notifs', error);
		}
	}

  const contextData = {
		ws,
		notifData,
		isWsConnected,
		setIsWsConnected,
		setFriendRequest,
		getNotfications,
		setNotifData,
  };

  return (
    <NotifContext.Provider value={contextData}>
      {children}
    </NotifContext.Provider>
  );
};
