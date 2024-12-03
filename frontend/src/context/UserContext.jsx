import { createContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import FetchWrapper from "../utils/fetchWrapper";

const UserContext = createContext();

export default UserContext;

export const UserProvider = ({ children }) => {
	const FetchData = new FetchWrapper();
	const navigate = useNavigate();
	const [userInfo, setUserInfo] = useState(null);
	const [profileInfo, setProfileInfo] = useState(null);


	const getUserInfo = async () => {
		try {
			const res = await FetchData.get(`api/profile/0`);
			if (res.ok) {
				const data = await res.json();
				setUserInfo(data);
				setProfileInfo(data);
			} else {
				if (res.status === 401)
					navigate('/login');
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

	const contextData = {
		userInfo,
		profileInfo,
		getUserInfo,
		getProfile,
		setProfileInfo,
	}

	return (
		<UserContext.Provider value={contextData}>{children}</UserContext.Provider>
	)
};