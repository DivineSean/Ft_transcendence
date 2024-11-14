import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FetchWrapper from '../utils/fetchWrapper'

const useAuth = () => {

	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const FetchData = new FetchWrapper('https://localhost:8000/');

	useEffect(() => {
		const checkAuth = async () => {
			const res = await FetchData.get('api/check_auth/');
			if (res.ok) {
				const data = await res.json();
				if (data.authenticated)
					navigate('/home', {replace: true});

			} else {
				const refRes = await FetchData.post('api/token/refresh/');
				if (refRes.ok) {
					navigate('/home', {replace: true});
				}
				else
					setLoading(false);

			}
		}

		checkAuth();

	}, [navigate]);

	return loading;
}

export default useAuth;