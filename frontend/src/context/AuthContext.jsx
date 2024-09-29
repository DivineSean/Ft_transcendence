import { createContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import {jwtDecode} from 'jwt-decode';
import Cookies from 'js-cookie'

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
	const [user, setUser] = useState(() => Cookies.get('accessToken') ? Cookies.get('accessToken') : null);
	const navigate = useNavigate();
	const validationErrors = {};
	const emailRegex = /\S+@\S+\.\S+/;
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}'";:,.<>])[A-Za-z\d!@#$%^&*()_+={}'";:,.<>]{6,}$/;

	// validation form
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: ''
	})
	const [error, setError] = useState({});

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

	const checkAuth = async () => {
		const accessToken = Cookies.get('accessToken');
		if (!accessToken)
			return;
		try {
			const authResponse = await fetch('https://localhost:8000/api/check_auth/', {
					method: 'GET',
					credentials: 'include'
				});
				console.log(authResponse);
				if (authResponse.ok) {
					const authData = await authResponse.json();
					if (authData.authenticated) {
						navigate('/home');
					} else {
						navigate('/login');
					}
				}
				if (authResponse.statusText === 'Unauthorized') {
					const refreshResponse = await fetch('https://localhost:8000/api/token/refresh/', {
						method: 'POST',
						credentials: 'include'
					});
					if (refreshResponse.statusText === 'Unauthorized') {
						Cookies.remove('accessToken');
						navigate('/login');
					}
					if (refreshResponse.ok) {
						navigate('/home');
					}
					console.log(refreshResponse);
				}
		} catch(error) {
			navigate('/login');
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
				const response = await fetch('https://localhost:8000/api/register/', {
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
	
				const data = await response.json();
	
				if (response.ok) {
					setUser(data);
					console.log(data);
					console.log('user registred successfuly');
					navigate('/login');
				} else {
					console.log('Error: ' + JSON.stringify(data));
				}
			} catch (error) {
				console.error('error: ', error);
				console.log('an error accured, please try again');
			}
		}
	}

	const login = async (e) => {
		e.preventDefault();
		for (const data in formData) {
			if (data === 'email' && !emailRegex.test(formData[data]))
				validationErrors[data] = `${data} is not valid!`;
			if (data === 'email' && !formData[data].trim()) {
				validationErrors[data] = `${data} is required!`;
			}
		}
		setError(validationErrors);

		if (Object.keys(validationErrors).length === 0) {
			console.log('email', e.target.email.value);
			console.log('password', e.target.password.value);
			try {
				const response = await fetch('https://localhost:8000/api/token/', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						'email': e.target.email.value,
						'password': e.target.password.value
					})
				});
				console.log('response', response);
				const data = await response.json();
	
				if (response.ok) {
					console.log(jwtDecode(data.access));
					setUser(data);
					console.log('user logedin successfuly');
					navigate('/home');
				} else {
					console.log('Error: ' + JSON.stringify(data), response.status);
				}
			} catch (error) {
				console.error('error: ', error);
				console.log('an error accured, please try again');
			}
		}
	}

	const contextData = {
		user: user,
		error: error,
		register: register,
		login: login,
		handleBlur: handleBlur,
		handleChange: handleChange,
		checkAuth: checkAuth
	}

	return (
		<AuthContext.Provider value={contextData}>
			{children}
		</AuthContext.Provider>
	)
}