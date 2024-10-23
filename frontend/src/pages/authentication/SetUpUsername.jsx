import AuthContext from "../../context/AuthContext";
import InputFieled from "../../components/InputField";
import { useContext, useEffect, useState } from "react";
import ResetPassword from "./ResetPassword";
import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";

const SetUpUsername = () => {
	const { uid } = useParams();
	const navigate = useNavigate();
	const {
		handleBlur,
		handleChange,
		error,
		setUpUsername,
		globalMessage,
		setGlobalMessage
	} = useContext(AuthContext);
	let [userData, setUserData] = useState({});

	const getFirstLastName = async () => {
		const postFormData = new FormData();
		postFormData.append('id', uid);
		try {
			const response = await fetch('https://localhost:8000/api/user/', {
				method: 'POST',
				body: postFormData,
			});
			const data = await response.json();
			setUserData(data);
			if (response.ok) {
				if (data.user.username != null) {
					navigate('/home');
				}
			} else {
				navigate('/login');
			}
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		if (uid) {
			getFirstLastName();
		}
	}, []);

	return (
		<div className="grow">
			{globalMessage.message &&
				<Toast
					message={globalMessage.message}
					error={globalMessage.isError}
					onClose={setGlobalMessage}
				/>
			}
			<div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
				<div className="backdrop-blur-md w-full h-full absolute top-0 right-0"></div>
				<div className="login-glass overflow-hidden md:p-32 p-0 flex justify-center items-center grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
					{
						userData && userData.user && 
						<>
							<div className="md:px-64 px-32 flex flex-col justify-center items-center md:gap-32 gap-24 lg:py-64 py-32 grow">
								<div className="flex flex-col gap-8 items-center">
									<h1 className="md:text-h-lg-xl text-h-sm-lg font-bold">
										Hello
										<span className="text-green lowercase"> {userData.user.first_name}</span>
										<span className="lowercase">, {userData.user.last_name}!</span>
										
									</h1>
									<p className="md:text-txt-sm text-txt-xs text-center text-gray">welcome to our world, it seems like this is your first time on our website you are in the correct place.</p>
								</div>

								<p className="md:text-txt-sm text-txt-xs text-center font-semibold">Please set up your username so your friends can identify you</p>
								<form onSubmit={(e) => setUpUsername(e, uid)} className="md:py-32 py-16 flex flex-col gap-48 w-full max-w-[500px]">

									<div className="flex flex-col gap-10">
										<InputFieled 
											name="username"
											type="text"
											placeholder="Username"
											onChange={handleChange}
											onBlur={handleBlur}
											error={error.username} 
										/>
										{error.username && <span className="text-red text-txt-sm">{error.username}</span>}
									</div>

									<button type="submit" className="bg-green text-black text-h-sm-lg font-bold py-8 rounded">Set Up</button>
								</form>
							</div>
						</>
					}
				</div>
			</div>
		</div>
	)
}

export default SetUpUsername;