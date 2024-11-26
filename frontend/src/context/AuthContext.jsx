import { createContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import FetchWrapper from "../utils/fetchWrapper";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {

	const FetchData = new FetchWrapper();
	const [displayMenuGl, setDisplayMenuGl] = useState(false);

	const navigate = useNavigate();
	const validationErrors = {};
	const emailRegex = /\S+@\S+\.\S+/;
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}'";:,.<>])[A-Za-z\d!@#$%^&*()_+={}'";:,.<>]{6,}$/;
	const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{3,}$/;

	const [formData, setFormData] = useState({
		username: '',
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
	})
	const [error, setError] = useState({});

	const location = useLocation();
	const [globalMessage, setGlobalMessage] = useState({ message: '', isError: false });


	useEffect(() => {
		setError({});
	}, [location])

	const handleBlur = (e) => {
		const { name, value } = e.target;
		if (!value.trim()) {
			validationErrors[name] = `${name} is required!`;
		}
		setError(validationErrors);
	}

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === 'email') {
			if (!emailRegex.test(formData.email)) {
				validationErrors.email = 'email is not valid!';
			}
		} else if (name === 'password') {
			if (!passwordRegex.test(value)) {
				validationErrors.password = 'password must contain at least 6 characters, uppercase, lowercase, number and special character.';
			}
		} else if (name === 'confirmPassword') {
			if (value !== formData.password) {
				validationErrors.confirmPassword = 'password does not matched!';
			}
		}
		setFormData({
			...formData, [name]: value
		})
		setError(validationErrors);
	}

	const handleChangePassLogin = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData, [name]: value
		})
	}

	const authProvider = async (provider) => {
		let url;
		if (provider === 'intra')
			url = 'api/intra/';
		else
			url = 'api/google/';
		try {
			const res = await FetchData.get(url);
			const data = await res.json();
			if (res.ok) {
				window.location.href = data.url;
			} else
				setGlobalMessage({ message: data.error, isError: true });
		} catch (error) {
			setGlobalMessage({ message: 'something went wrong!', isError: true });
		}
	}

	const register = async (e) => {
		e.preventDefault();

		for (const data in formData) {
			if (data === 'email' && !emailRegex.test(formData[data]))
				validationErrors[data] = `${data} is not valid!`;
			if (data === 'password' && !passwordRegex.test(formData[data]))
				validationErrors[data] = `${data} must contain at least 6 characters, uppercase, lowercase, number and special character.`;
			if (data === 'confirmPassword' && formData.password != formData[data])
				validationErrors[data] = 'password does not matched!';

			if (!formData[data].trim() && data !== 'username') {
				validationErrors[data] = `${data} is required!`;
			}
		}
		setError(validationErrors);

		if (Object.keys(validationErrors).length === 0) {
			try {
				const res = await FetchData.post('api/register/', {
					'first_name': e.target.firstName.value,
					'last_name': e.target.lastName.value,
					'email': e.target.email.value,
					'password': e.target.password.value
				});
				if (res.status === 200) {
					navigate('/login');
				} else {
					if (res.status === 404)
						setGlobalMessage({ message: 'the url you have reached is not found!', isError: true });
					else
						setGlobalMessage({ message: 'email already exists or some cridentials not correct!', isError: true });
				}
			} catch (error) {

				setGlobalMessage({ message: 'something went wrong!', isError: true });

			}
		}
	}

	const login = async (e) => {
		e.preventDefault();
		for (const data in formData) {
			if (data === 'email' && !emailRegex.test(formData[data]))
				validationErrors[data] = `invalid ${data}!`;
			if (data === 'email' && !formData[data].trim())
				validationErrors[data] = `${data} is required!`;
			if (data === 'password' && !formData[data].trim())
				validationErrors[data] = `${data} is required!`;
		}
		setError(validationErrors);


		if (Object.keys(validationErrors).length === 0) {

			try {
				const res = await FetchData.post('api/token/', {
					'email': e.target.email.value,
					'password': e.target.password.value,
				});
				if (res.ok) {
					const data = await res.json();
					console.log(data);
					if (data.requires_2fa)
						navigate(`/twofa/${data.uid}`);
					else {
						if (data.username === null)
							navigate(`setupusername/${data.uid}`);
						else
							navigate('/home');
					}
				} else {
					if (res.status === 404)
						setGlobalMessage({ message: 'the url you have reached is not found!', isError: true });
					else {
						const data = await res.json();
						setGlobalMessage({ message: `error: email or password are invalid please try again!`, isError: true });
					}
				}

			} catch (error) {
				setGlobalMessage({ message: `error: ${error}`, isError: true });
			}

		}
	}

	const authorization2FA = async (e, userId, values2FA) => {
		e.preventDefault();
		try {
			const res = await FetchData.post('api/token/', {
				'id': userId,
				'2fa_code': values2FA.join(''),
			});

			const data = await res.json();
			if (res.ok) {
				if (data.username === null)
					navigate(`setupusername/${data.uid}`);
				else
					navigate('/home');
			} else
				setGlobalMessage({ message: data.error, isError: true });
		} catch (error) {
			setGlobalMessage({ message: `error: ${error}`, isError: true });
		}
	}

	const resent2FACode = async (userId, type) => {
		try {
			const res = await FetchData.post('api/resent2fa/', { 'id': userId, 'type': type });
			if (!res.ok)
				setGlobalMessage({ message: 'something went wrong!', isError: true });
		} catch (error) {
			setGlobalMessage({ message: `error: ${error}`, isError: true });
		}
	}

	const requestResetPassword = async (e) => {
		e.preventDefault();
		for (const data in formData) {
			if (data === 'email' && !emailRegex.test(formData[data]))
				validationErrors[data] = `invalid ${data}!`;
			if (data === 'email' && !formData[data].trim())
				validationErrors[data] = `${data} is required!`;
		}
		setError(validationErrors);

		if (Object.keys(validationErrors).length === 0) {
			try {
				const res = await FetchData.post('api/requestreset/', { 'email': e.target.email.value });
				const data = await res.json();
				if (res.ok)
					navigate(`/forgotpassword/${data.uid}`)
				else
					setGlobalMessage({ message: data.error, isError: true });
			} catch (error) {
				setGlobalMessage({ message: `error: ${error}`, isError: true });
			}
		}
	}

	const changePassword = async (e, userId, values2FA) => {
		e.preventDefault();
		for (const data in formData) {
			if (data === 'password' && !passwordRegex.test(formData[data]))
				validationErrors[data] = `${data} must contain at least 6 characters, uppercase, lowercase, number and special character.`;
			if (data === 'confirmPassword' && formData.password != formData[data])
				validationErrors[data] = 'password does not matched!';

			if (!formData[data].trim() && (data === 'password' || data === 'confirmPassword')) {
				validationErrors[data] = `${data} is required!`;
			}
		}
		setError(validationErrors);

		if (Object.keys(validationErrors).length === 0) {
			try {
				const res = await FetchData.post('api/changepassword/', {
					'id': userId,
					'newPassword': e.target.password.value,
					'code': values2FA.join(''),
				});
				if (res.ok)
					navigate('/login');
				else {
					const data = await res.json();
					setGlobalMessage({ message: data.error, isError: true });
				}
			} catch (error) {
				setGlobalMessage({ message: `error: ${error}`, isError: true });
			}
		}
	}

	const logout = async () => {
		try {
			const res = await FetchData.post('api/logout/');
			if (res.ok) {
				navigate('/login');
				setGlobalMessage({ message: 'you have successfully logged out!', isError: false });
				setDisplayMenuGl(false);
			} else
				setGlobalMessage({ message: data.error, isError: true });
		} catch (error) {
			setGlobalMessage({ message: `error: ${error}`, isError: true });
		}
	}

	const setUpUsername = async (e, userId) => {
		e.preventDefault();
		for (const data in formData) {
			if (data === 'username' && (!formData[data].trim() && !usernameRegex.test(formData[data])))
				validationErrors[data] = `${data} is required!`;
			if (data === 'username' && !usernameRegex.test(formData[data]))
				validationErrors[data] = `${data} must contain at least 4 characters! examples, user123, user_123, user-123`;
		}
		setError(validationErrors);


		if (Object.keys(validationErrors).length === 0) {
			try {
				const res = await FetchData.post('api/setupusername/', {
					'id': userId,
					'username': e.target.username.value,
				});
				const data = await res.json();
				if (res.ok)
					navigate('/home');
				else
					setGlobalMessage({ message: data.error, isError: true });
			} catch (error) {
				setGlobalMessage({ message: `error: ${error}`, isError: true });
			}
		}
	}

	const contextData = {
		error: error,
		globalMessage: globalMessage,
		displayMenuGl: displayMenuGl,
		displayMenuGl: displayMenuGl,

		register: register,
		login: login,
		logout: logout,

		authProvider: authProvider,
		authorization2FA: authorization2FA,
		resent2FACode: resent2FACode,
		requestResetPassword: requestResetPassword,
		changePassword: changePassword,

		handleBlur: handleBlur,
		handleChange: handleChange,
		handleChangePassLogin: handleChangePassLogin,

		setGlobalMessage: setGlobalMessage,
		setDisplayMenuGl: setDisplayMenuGl,
		setUpUsername: setUpUsername
	}

	return (
		<AuthContext.Provider value={contextData}>
			{children}
		</AuthContext.Provider>
	)
}
