import { createContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import Toast from "../components/Toast";

const URL = 'https://localhost:8000/';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {

	const [displayMenuGl, setDisplayMenuGl] = useState(false);

	const navigate = useNavigate();
	const validationErrors = {};
	const emailRegex = /\S+@\S+\.\S+/;
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}'";:,.<>])[A-Za-z\d!@#$%^&*()_+={}'";:,.<>]{6,}$/;
	const usernameRegex = /^[a-zA-Z][a-zA-Z0-9!@#$%^&*()\-_=+{}\[\]|\\;:'",.<>?]*$/;

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
	const [globalMessage, setGlobalMessage] = useState({message: '', isError: false});


	useEffect(() => {
		setError({});
	}, [location])

	const handleBlur = (e) => {
		const {name, value} = e.target;
		if (!value.trim()) {
			validationErrors[name] = `${name} is required!`;
		}
		setError(validationErrors);
	}

	const handleChange = (e) => {
		const {name, value} = e.target;
		if (name === 'email') {
			if (!emailRegex.test(formData.email)) {
				validationErrors.email = 'email is not valid!';
			}
		} else if (name === 'password') {
			if (!passwordRegex.test(value)) {
				validationErrors.password = 'password must contain at least 6 character, uppercase, lowercase, number and special character.';
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
		const {name, value} = e.target;
		setFormData({
			...formData, [name]: value
		})
	}

	const authProvider = async (provider) => {
		let url;
		if (provider === 'intra')
			url = `${URL}api/intra/`;
		else
			url = `${URL}api/google/`;
		try {

			const response = await fetch(url, {
				method: 'GET'
			});

			const data = await response.json();
			if (response.ok) {
				window.location.href = data.url;
			} else
				setGlobalMessage({message: data.error, isError: true});
		} catch(error) {
			setGlobalMessage({message: 'something went wrong!', isError: true});
		}
	}

	const register = async (e) => {
		e.preventDefault();

		for (const data in formData) {
			if (data === 'email' && !emailRegex.test(formData[data]))
				validationErrors[data] = `${data} is not valid!`;
			if (data === 'password' && !passwordRegex.test(formData[data]))
				validationErrors[data] = `${data} must contain at least 6 character, uppercase, lowercase, number and special character.`;
			if (data === 'confirmPassword' && formData.password != formData[data])
				validationErrors[data] = 'password does not matched!';

			if (!formData[data].trim() && data !== 'username') {
				validationErrors[data] = `${data} is required!`;
			}
		}
		setError(validationErrors);

		if (Object.keys(validationErrors).length === 0) {
			try {
				const response = await fetch(`${URL}api/register/`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						'first_name': e.target.firstName.value,
						'last_name': e.target.lastName.value,
						'email': e.target.email.value,
						'password': e.target.password.value
					})
				});
				if (response.ok)
					navigate('/login');
				else
					setGlobalMessage({message: data.error, isError: true});
			} catch (error) {

				setGlobalMessage({message: 'something went wrong!', isError: true});

			}
		}
	}

	const login = async (e, setLoginError) => {
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
			
			const postFormData = new FormData();
			const email = e.target.email.value;
			const password = e.target.password.value;
			postFormData.append('email', email);
			postFormData.append('password', password);

			try {
				const response = await fetch(`${URL}api/token/`, {
					method: 'POST',
					credentials: 'include',
					body: postFormData
				});
				if (response.ok) {
					const data = await response.json();
					if (data.requires_2fa) {
						navigate(`/twofa/${data.uid}`)
					} else {
						navigate('/home');
					}
				} else {
					if (response.status === 401)
						setGlobalMessage({message: 'invalid email or password!', isError: true});
					else 
						setGlobalMessage({message: 'something went wrong!', isError: true});
				}
			} catch (error) {
				setGlobalMessage({message: `error: ${error.message}`, isError: true});
			}

		}
	}

	const authorization2FA = async (e, userId, values2FA) => {
		e.preventDefault();
		const postFormData = new FormData();
		postFormData.append('id', userId)
		postFormData.append('2fa_code', values2FA.join(''));
		try {
			const response = await fetch(`${URL}api/token/`, {
				method: 'POST',
				credentials: 'include',
				body: postFormData
			});
			const data = await response.json();
			console.log(data);
			if (response.ok) {
				if (data.username === null)
					navigate(`setupusername/${data.uid}`);
				else
					navigate('/home');
			} else
				setGlobalMessage({message: data.error, isError: true});
		} catch (error) {
			setGlobalMessage({message: `error: ${error.message}`, isError: true});
		}
	}

	const resent2FACode = async (userId) => {
		const postFormData = new FormData();
		postFormData.append('id', userId);
		try {
			const response = await fetch(`${URL}api/resent2fa/`, {
				method: 'POST',
				credentials: 'include',
				body: postFormData
			});
		} catch (error) {
			setGlobalMessage({message: `error: ${error.message}`, isError: true});
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
			const email = e.target.email.value;
			const postFormData = new FormData();
			postFormData.append('email', email)
			try {
				const response = await fetch(`${URL}api/requestreset/`, {
					method: 'POST',
					credentials: 'include',
					body: postFormData
				});
				const data = await response.json();
				if (response.ok)
					navigate(`/forgotpassword/${data.uid}`)
				else
					setGlobalMessage({message: data.error, isError: true});
			} catch (error) {
				setGlobalMessage({message: `error: ${error.message}`, isError: true});
			}
		}
	}

	const changePassword = async (e, userId, values2FA) => {
		e.preventDefault();
		for (const data in formData) {
			if (data === 'password' && !passwordRegex.test(formData[data]))
				validationErrors[data] = `${data} must contain at least 6 character, uppercase, lowercase, number and special character.`;
			if (data === 'confirmPassword' && formData.password != formData[data])
				validationErrors[data] = 'password does not matched!';

			if (!formData[data].trim() && (data === 'password' || data === 'confirmPassword')) {
				validationErrors[data] = `${data} is required!`;
			}
		}
		setError(validationErrors);

		if (Object.keys(validationErrors).length === 0) {
			const postFormData = new FormData();
			const newPassword = e.target.password.value;
			postFormData.append('id', userId);
			postFormData.append('newPassword', newPassword);
			postFormData.append('code', values2FA.join(''));
			try {
				const response = await fetch(`${URL}api/changepassword/`, {
					method: 'POST',
					credentials: 'include',
					body: postFormData
				});
				if(response.ok)
					navigate('/login');
				else
					setGlobalMessage({message: data.error, isError: true});
			} catch (error) {
				setGlobalMessage({message: `error: ${error.message}`, isError: true});
			}
		}
	}

	const logout = async () => {
		try {
			const response = await fetch(`${URL}api/logout/`, {
				method: 'POST',
				credentials: 'include'
			});
			if (response.ok) {
				navigate('/login');
				setDisplayMenuGl(false);
			} else 
				setGlobalMessage({message: data.error, isError: true});
		} catch (error) {
			setGlobalMessage({message: `error: ${error.message}`, isError: true});
		}
	}

	const setUpUsername = async (e, userId) => {
		e.preventDefault();
		for (const data in formData) {
			if (data === 'username' && (!formData[data].trim() && !usernameRegex.test(formData[data])))
				validationErrors[data] = `${data} is required!`;
			if (data === 'username' && !usernameRegex.test(formData[data]))
				validationErrors[data] = `invalid ${data}!`;
		}
		setError(validationErrors);


		if (Object.keys(validationErrors).length === 0) {
			const username = e.target.username.value;
			const postFormData = new FormData();
			postFormData.append('id', userId);
			postFormData.append('username', username)
			try {
				const response = await fetch(`${URL}api/setupusername/`, {
					method: 'POST',
					credentials: 'include',
					body: postFormData
				});
				const data = await response.json();
				if (response.ok)
					navigate('/home');
				else
					setGlobalMessage({message: data.error, isError: true});
			} catch (error) {
				setGlobalMessage({message: `error: ${error.message}`, isError: true});
			}
		}
	}

	const contextData = {
		error: error,
		globalMessage: globalMessage,
		displayMenuGl: displayMenuGl,
		register: register,
		displayMenuGl: displayMenuGl,
		login: login,
		handleBlur: handleBlur,
		handleChange: handleChange,
		handleChangePassLogin: handleChangePassLogin,
		authProvider: authProvider,
		authorization2FA: authorization2FA,
		resent2FACode: resent2FACode,
		requestResetPassword: requestResetPassword,
		changePassword: changePassword,
		setGlobalMessage: setGlobalMessage,
		logout: logout,
		setDisplayMenuGl: setDisplayMenuGl,
		setUpUsername: setUpUsername
	}

	return (
		<AuthContext.Provider value={contextData}>
			{children}
		</AuthContext.Provider>
	)
}