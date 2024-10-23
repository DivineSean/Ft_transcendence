import { createContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import Toast from "../components/Toast";

const URL = 'https://localhost:8000/';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {

	const navigate = useNavigate();
	const validationErrors = {};
	const emailRegex = /\S+@\S+\.\S+/;
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}'";:,.<>])[A-Za-z\d!@#$%^&*()_+={}'";:,.<>]{6,}$/;

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: ''
	})
	const [error, setError] = useState({});

	const location = useLocation();
	const [globalError, setGlobalError] = useState('');


	const [values2FA, setValues2FA] = useState(Array(6).fill(''));
	const inputs = useRef([]);

	const handleChange2FA = (e, index) => {
		const value = e.target.value;
		if (/^[0-9]$/.test(value)) {
			const newValues = [...values2FA];
			newValues[index] = value;
			setValues2FA(newValues);
			if (index < 5 && value) {
				inputs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown2FA = (e, index) => {
		if (e.key === 'Backspace') {
			const newValues = [...values2FA];
			if (newValues[index]) {
				newValues[index] = '';
				setValues2FA(newValues);
			} else if (index > 0) {
				inputs.current[index - 1].focus();
				const prevValues = [...values2FA];
				prevValues[index - 1] = '';
				setValues2FA(prevValues);
			}
		}
	}

	useEffect(() => {
		setValues2FA(Array(6).fill(''));
		setGlobalError('');
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
			}

		} catch(error) {

			console.log('error from intra auth:', error);

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

			if (!formData[data].trim()) {
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
				
				if (response.ok) {
					navigate('/login');
				} else {
					if (response.status === 400)
						setGlobalError('user with this email already exists.');
				}
			} catch (error) {

				setGlobalError('something went wrong!');

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
					if (response.status === 401) {
						setGlobalError('invalid email or password! please try again.');
					}
				}
			} catch (error) {
				setGlobalError('something went wrong!');
			}

		}
	}

	const authorization2FA = async (e, userId) => {
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
			console.log(response);
			if (response.ok) {
				navigate('/home');
			}
		} catch (error) {
			console.log('error: ', error);
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
			const data = await response.json();
		} catch (error) {
			console.log('error: ', error);
		}
	}

	const requestResetPassword = async (e) => {
		e.preventDefault();
		
		const email = e.target.email.value;
		const postFormData = new FormData();
		postFormData.append('email', email)
		console.log(email);
		try {
			const response = await fetch(`${URL}api/requestreset/`, {
				method: 'POST',
				credentials: 'include',
				body: postFormData
			});
			const data = await response.json();
			if (response.ok) {
				navigate(`/forgotpassword/${data.uid}`)
			}
		} catch (error) {
			alert('error', error);
		}
	}

	const changePassword = async (e, userId) => {
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
			console.log(userId);
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
			} catch (error) {
				alert('error', error);
			}
		} else {
			console.log('hello man');
		}
	}

	const contextData = {
		error: error,
		values2FA: values2FA,
		globalError: globalError,
		inputs: inputs,
		register: register,
		login: login,
		handleBlur: handleBlur,
		handleChange: handleChange,
		handleChangePassLogin: handleChangePassLogin,
		authProvider: authProvider,
		handleChange2FA: handleChange2FA,
		handleKeyDown2FA: handleKeyDown2FA,
		authorization2FA: authorization2FA,
		resent2FACode: resent2FACode,
		requestResetPassword: requestResetPassword,
		changePassword: changePassword,
		setGlobalError: setGlobalError
	}

	return (
		<AuthContext.Provider value={contextData}>
			{children}
		</AuthContext.Provider>
	)
}