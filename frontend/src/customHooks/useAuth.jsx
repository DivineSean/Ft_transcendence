import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuth = () => {

	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const checkAuth = async () => {
			const response = await fetch(`https://${window.location.hostname}:8000/api/check_auth/`, {
				method: 'GET',
				credentials: 'include',
			});
			if (response.ok) {

				const data = await response.json();
				if (data.authenticated)
					navigate('/home', { replace: true });

			} else {

				const refreshResponse = await fetch(`https://${window.location.hostname}:8000/api/token/refresh/`, {
					method: 'POST',
					credentials: 'include'
				});

				if (refreshResponse.ok) {
					navigate('/home', { replace: true });
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
