import InputFieled from "../../components/authentication/InputField"
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import FetchWrapper from "../../utils/fetchWrapper";
import useAuth from "../../customHooks/useAuth";
import Toast from "../../components/Toast";
import { FcGoogle } from "react-icons/fc";
import LoadingPage from "../LoadingPage";
import { Si42 } from "react-icons/si";

const Login = () => {
	
	const {
		login,
		error,
		handleBlur,
		authProvider,
		handleChange,
		handleChangePassLogin,
		globalMessage,
		setGlobalMessage
	} = useContext(AuthContext);
	const location = useLocation();
	const FetchData = new FetchWrapper();
	const navigate = useNavigate();
	const [load, setLoad] = useState(true);
	
	const sendCode = async (code, prompt) => {
		try {
			const res = await FetchData.post('api/callback/', {
				'code': code,
				'prompt': prompt
			});
			if (res.ok) {
				const data = await res.json();
				if (data.username === null)
					navigate(`/setupusername/${data.uid}`);
				else
					navigate('/home');
			} else {
				setGlobalMessage({message: 'something went wrong', isError: true});
				navigate('/login');
			}
		} catch (error) {
			setGlobalMessage({message: `error: ${error}`, isError: true});
		}
	}
	
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const prompt = urlParams.get('prompt');
		if (code) {
			sendCode(code, prompt);
		} else {
			setLoad(false);
		}
	}, [location]);

	const loading = useAuth();
	
	return (
		<div className="grow">
			{(loading || load) && 
				<LoadingPage />
			}
			{!loading && !load &&
				<div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
					{globalMessage.message &&
						<Toast
							message={globalMessage.message}
							error={globalMessage.isError}
							onClose={setGlobalMessage}
						/>
					}
					<div className="backdrop-blur-md w-full h-full absolute top-0 right-0"></div>
					<div className="lg:grid lg:grid-cols-[1fr_1fr] login-glass overflow-hidden flex flex-col grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
						<div className="md:px-64 px-32 flex flex-col justify-center md:gap-32 gap-24 lg:py-64 py-32 grow">
							<div className="flex flex-col gap-8">
								<h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">Welcome back, Player</h1>
								<p className="md:text-txt-lg text-txt-sm">Welcome back! Please enter your details</p>
							</div>

							<form onSubmit={login} className="md:py-32 py-16 flex flex-col md:gap-32 gap-16">

								<div className="flex flex-col gap-10">
									<InputFieled name="email" type="text" placeholder="Example@gmail.com" onChange={handleChange} onBlur={handleBlur} error={error.email} />
									{error.email && <span className="text-red">{error.email}</span>}
								</div>

								<div className="flex flex-col gap-10">
									<InputFieled name="password" type="password" onChange={handleChangePassLogin} onBlur={handleBlur} placeholder="Password" error={error.password} />
									{error.password && <span className="text-red">{error.password}</span>}
								</div>

								<div className="flex justify-end">
									<Link to="/forgotpassword" className="underline">forget password?</Link>
								</div>

								<button type="submit" className="bg-green text-black text-h-sm-lg font-bold py-8 rounded">Log In</button>

								<div className="flex gap-8 justify-center md:text-txt-md text-txt-sm">
									<p className="">don't have an account?</p>
									<Link to='/register' className="font-bold">register</Link>
								</div>

							</form>

							<div className="flex gap-16 items-center">
								<hr className="grow text-stroke-sc" />
								<p className="">or</p>
								<hr className="grow text-stroke-sc" />
							</div>

							<button onClick={() => authProvider('intra')} className="flex gap-16 py-8 justify-center items-center capitalize rounded border border-stroke-sc">
								<Si42 className="text-txt-3xl"/>
								<p className="">log in with intra</p>
							</button>

							<button onClick={() => authProvider('google')} className="flex gap-16 py-8 justify-center items-center capitalize rounded border border-stroke-sc">
								<FcGoogle className="text-txt-3xl"/>
								<p>log in with google</p>
							</button>

						</div>

						<div className="bg-[url('/images/login/login.jpeg')] bg-cover bg-bottom flex flex-col">
							<div className="cover-gradient grow"></div>
						</div>
					</div>
				</div>
			}
		</div>
	)
}

export default Login