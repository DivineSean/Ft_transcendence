import { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import Cookies from 'js-cookie'

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {

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
	const [loginError, setLoginError] = useState('');
	const [registerError, setRegisterError] = useState('');

	const location = useLocation();


	useEffect(() => {
		if (location.pathname !== '/login')
			setLoginError('');
		else if (location.pathname !== '/register')
			setRegisterError('');
	}, [location.pathname])

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
		const { name, value } = e.target;
		setFormData({
			...formData, [name]: value
		})
	}

	const authProvider = async (provider) => {
		let url;
		if (provider === 'intra')
			url = `https://${window.location.hostname}:8000/api/intra/`;
		else
			url = `https://${window.location.hostname}:8000/api/google/`;
		try {

			const response = await fetch(url, {
				method: 'GET'
			});

			const data = await response.json();
			if (response.ok) {
				window.location.href = data.url;
			}

		} catch (error) {

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
				const response = await fetch(`https://${window.location.hostname}:8000/api/register/`, {
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
						setRegisterError('user with this email already exists.');

				}
			} catch (error) {

				console.error('error: ', error);

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
				const response = await fetch(`https://${window.location.hostname}:8000/api/token/`, {
					method: 'POST',
					credentials: 'include',
					body: postFormData
				});

				if (response.ok)
					navigate('/home');
				else {
					if (response.status === 401)
						setLoginError('invalid email or password! please try again.');
				}
			} catch (error) {
				console.error('error: ', error);
			}

		}
	}

	const contextData = {
		error: error,
		loginError: loginError,
		registerError: registerError,
		register: register,
		login: login,
		handleBlur: handleBlur,
		handleChange: handleChange,
		handleChangePassLogin: handleChangePassLogin,
		authProvider: authProvider
	}

	return (
		<AuthContext.Provider value={contextData}>
			{children}
		</AuthContext.Provider>
	)
}
