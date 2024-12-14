import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
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


	const getUserInfo = async () => {
		try {
			const res = await FetchData.get(`api/profile/0`);
			if (res.ok) {
				const data = await res.json();
				setUserInfo(data);
				setProfileInfo(data);
				setProfileImage(data.profile_image);
				setGeneralLoading(false);
			} else {
				if (res.status === 401) {
					authContextData.setGlobalMessage({message: 'unauthorized user', isError: true});
					navigate('/login');
				}
			}
		} catch (error) {
			console.log('error:', error);
		}
	}

	const getProfile = async (username) => {
		try {
			const res = await FetchData.get(`api/profile/${username}`);
			if (res.ok) {
				const data = await res.json();
				setProfileInfo(data);
			} else {
				console.log('hello');
				if (res.status === 404)
					navigate('/profile/overview');
				if (res.status === 401)
					navigate('/login');
			}

		} catch (error) {
			console.log('error', error);
		}
	}

	const updateProfileImage = (newImageUrl) => {
		setProfileImage(newImageUrl);
		setUserInfo((prevUserInfo) => ({
			...prevUserInfo,
			profile_image: newImageUrl,
		}))
	}

	const contextData = {
		userInfo,
		profileInfo,
		generalLoading,
		getUserInfo,
		getProfile,
		setProfileInfo,
		setProfileImage,
		updateProfileImage,
	}

	return (
		<UserContext.Provider value={contextData}>{children}</UserContext.Provider>
	)
};