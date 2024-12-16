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

  const getUserInfo = async () => {
    try {
      const res = await FetchData.get(`api/profile/`);
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data);
        // setProfileInfo(data);
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
    try {
      const res = await FetchData.get(`api/profile/${username}`);
      if (res.ok) {
        const data = await res.json();
				console.log('data', data.isBlockedByUser);
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
		const url = username ? `friends/getFriends/${username}` : `friends/getFriends/`;
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
	const setFriendRequest = async () => {
		try {
			const res = await FetchData.get('friends/getfr/');
			if (res.ok) {
				const data = await res.json();
				setUserFriendRequest(data);
			}
		} catch (error) {
			console.log('chihaja mahiyach fhad get frinds', error);
		}
	}

  const contextData = {
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
		setFriendRequest,
		setUserFriends,
  };

  return (
    <UserContext.Provider value={contextData}>{children}</UserContext.Provider>
  );
};
