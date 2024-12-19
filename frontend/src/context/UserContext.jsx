import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FetchWrapper from "../utils/fetchWrapper";
import AuthContext from "./AuthContext";

const UserContext = createContext();

export default UserContext;

export const UserProvider = ({ children }) => {
  const authContextData = useContext(AuthContext);
  const FetchData = new FetchWrapper();
  const navigate = useNavigate();
  const [generalLoading, setGeneralLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
	const [userFriends, setUserFriends] = useState(null);
	const [userFriendRequest, setUserFriendRequest] = useState(null);
	const [refresh, setRefresh] = useState(false);
	const [isMe, setIsMe] = useState(true);

  const getUserInfo = async () => {
    try {
      const res = await FetchData.get(`api/profile/`);
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data);
        setProfileImage(data.profile_image);
        setGeneralLoading(false);
      } else {
        if (res.status === 401) {
          authContextData.setGlobalMessage({
            message: "unauthorized user",
            isError: true,
          });
          navigate("/login");
        }
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  const getProfile = async (username) => {
		let url; // i did this to make the username None (not undefined) cause the backend trigger it as invalid username
		if (username) 	url = `api/profile/${username}`;
		else 						url = `api/profile/`;

    try {
      const res = await FetchData.get(url);
      if (res.ok) {

        const data = await res.json();
				console.log('getProfile', data);

				if (data.isBlockedByUser) {

					console.log('rak mblocki fin ghadi');
					authContextData.setGlobalMessage({message: 'the user you request is blocked you!!', isError: true});
					navigate('/profile/overview')

				} else
        	setProfileInfo(data);
      } else {
        console.log("hello");
        if (res.status === 404) navigate("/profile/overview");
        if (res.status === 401) navigate("/login");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const updateProfileImage = (newImageUrl) => {
    setProfileImage(newImageUrl);
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      profile_image: newImageUrl,
    }));
  };

	const getFriends = async (username) => {
		const url = username ? `api/friends/${username}` : `api/friends/`;
		try {
			const res = await FetchData.get(url);
			if (res.ok) {
				const data = await res.json();
				setUserFriends(data);
			}
		} catch (error) {
			console.log('chihaja mahiyach fhad get frinds', error);
		}
	}

	const getFriendRequest = async () => {
		try {
			const res = await FetchData.get('api/friendrequests/');
			if (res.ok) {
				const data = await res.json();
				setUserFriendRequest(data);
				console.log('friend request', data);
			}
		} catch (error) {
			console.log('chihaja mahiyach fhad get friends', error);
		}
	}

	const sendFriendRequest = async (id) => {
		try {
			const res = await FetchData.post('api/friendrequest/send/', {'userId': id});
			if (res.ok) {
				const data = await res.json();
				setRefresh(true);
				authContextData.setGlobalMessage({message: data.message, isError: data.status !== '200'});
			}
		} catch (error) {
			console.log('error in send friend request: ', error);
		}
	}

	const cancelFriendRequest = async () => {
		try {
			const res = await FetchData.post('api/friendrequest/cancel/', {'userId': profileInfo.id});
			if (res.ok) {
				const data = await res.json();
				setRefresh(true);
				authContextData.setGlobalMessage({message: data.message, isError: data.status !== '200'});
			}
		} catch (error) {
			console.log('error cancel', error);
		}
	}
	
	const acceptFriendRequest = async (userId) => {
		try {
			const res = await FetchData.post('api/friendrequest/accept/', {'userId': userId});
			if (res.ok) {
				const data = await res.json();
				setRefresh(true);
				authContextData.setGlobalMessage({message: data.message, isError: data.status !== '200'});
			}
		} catch (error) {
			console.log('accept error:', error);
		}
	}

	const declineRequest = async (userId) => {
		try {
			const res = await FetchData.post('api/friendrequest/decline/', {'userId': userId});
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				setRefresh(true);
				authContextData.setGlobalMessage({message: data.message, isError: data.status !== '200'})
				console.log('rejected', data);
			}
		} catch (error) {
			authContextData.setGlobalMessage({message: error.message, isError: true});
		}
	}

	const unfriend = async () => {
		try {
			const res = await FetchData.post('api/friend/unfriend/', {'userId': profileInfo.id});
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				setRefresh(true);
				authContextData.setGlobalMessage({message: data.message, isError: data.status !== '200'});
				console.log(data);
			}
		} catch (error) {
			authContextData.setGlobalMessage({message: error.message, isError: true});
		}
	}

	const blockFriend = async () => {
		try {
			const res = await FetchData.post('api/friend/block/', {'userId': profileInfo.id})
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				setRefresh(true);
				console.log('block', data);
			}
		} catch (error) {
			console.log('error block', error);
		}
	}

	const unblockUser = async () => {
		try {
			const res = await FetchData.post('api/user/unblock/', {'userId': profileInfo.id});
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				setRefresh(true);
				authContextData.setGlobalMessage({message: data.message, isError: data.status !== '200'});
			}
		} catch (error) {
			authContextData.setGlobalMessage({message: error.message, isError: true});
		}
	}

	const sendMessage = async () => {
		try {
			const res = await FetchData.post('api/chat/conversations/', {'userId': profileInfo.id});
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				navigate(`/chat/${data.conversationId}`);
				console.log(data);
			} else if (res.status === 400) {
				const data = await res.json();
				console.log(data);
			}
		} catch (error) {
			authContextData.setGlobalMessage({message: error.message, isError: true});
		}
	}

  const contextData = {
		refresh,
		userFriendRequest,
		userFriends,
    userInfo,
    profileInfo,
    generalLoading,
    getUserInfo,
    getProfile,
    setProfileInfo,
    setProfileImage,
    setUserInfo,
    updateProfileImage,
		getFriends,
		getFriendRequest,
		setUserFriends,
		setRefresh,

		sendFriendRequest,
		cancelFriendRequest,
		acceptFriendRequest,
		declineRequest,
		blockFriend,
		unfriend,
		unblockUser,
		sendMessage,
  };

  return (
    <UserContext.Provider value={contextData}>{children}</UserContext.Provider>
  );
};
