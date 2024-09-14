import { createContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	const register = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch('https://localhost:8000/api/register/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					'first_name': e.target.first_name.value,
					'last_name': e.target.last_name.value,
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

	const login = async (e) => {
		e.preventDefault();
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
				console.log(data);
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

	const contextData = {
		user: user,
		register: register,
		login: login
	}

	return (
		<AuthContext.Provider value={contextData}>
			{children}
		</AuthContext.Provider>
	)
}