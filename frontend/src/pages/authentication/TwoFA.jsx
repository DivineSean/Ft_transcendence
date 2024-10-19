import AuthContext from "../../context/AuthContext";
import InputFieled from "../../components/InputField";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom'

const TwoFA = () => {
	const { uid } = useParams();
	const { handleChange2FA, handleKeyDown2FA, inputs, values2FA, authorization2FA, resent2FACode } = useContext(AuthContext);
	const [timer, setTimer] = useState(150);
	const [isActive, setIsActive] = useState(false);

	const resetTimer = () => {
		resent2FACode(uid);
		setTimer(150);
		setIsActive(false);
	}
	
	useEffect(() => {
		let interval = null;
		if (!isActive && timer > 0) {
			interval = setInterval(() => {
				setTimer((prevTime) => prevTime - 1);
			}, 1000)
		} else if (timer === 0) {
			clearInterval(interval);
			setIsActive(true);
		}
		
		return () => clearInterval(interval);
	}, [isActive, timer]);

	const formatTime = (time) => {
		const minutes = Math.floor(time / 60);
		const seconds = time % 60;
		return `0${minutes}:${seconds < 10 ? `0${seconds}`: seconds}`
	}

	return (
		<div className="grow">
			<div className="absolute min-h-screen w-screen backdrop-blur-xl"></div>
			<div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
			<div className="lg:grid lg:grid-cols-[1fr_1fr] login-glass overflow-hidden flex flex-col grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
					<div className="md:px-64 px-32 flex flex-col justify-center md:gap-32 gap-24 lg:py-64 py-32 grow">
						<div className="flex flex-col gap-8">
							<h1 className="md:text-h-lg-xl text-h-sm-lg font-bold">Authenticate Your Account</h1>
							<p className="md:text-txt-md text-txt-xs text-gray lg:w-full max-w-[600px]">Protecting your account is our top priority. Please confirm  your account by entering the authorization code sent to</p>
						</div>

						<form onSubmit={(e) => authorization2FA(e, uid)} className="md:py-32 py-16 flex flex-col gap-48">
							<div className="flex justify-between">
								{values2FA.map((value, index) => (
									<input 
										key={index}
										type="text"
										maxLength={1}
										value={value}
										onChange={(e) => handleChange2FA(e, index)}
										onKeyDown={(e) => handleKeyDown2FA(e, index)}
										ref={(el) => (inputs.current[index] = el)}
										className="bg-transparent outline-none text-center border-b-2 border-stroke-sc max-w-40 focus:border-green"
									/>
								))}
							</div>
							<button type="submit" className="bg-green text-black text-h-sm-lg font-bold py-8 rounded">Verify</button>
						</form>

						<div className="flex flex-col gap-8">
							<div className="flex gap-8 justify-center md:text-txt-md text-txt-sm">
								<p className="text-gray font-light text-txt-sm">
									It may take a minute to receive your code.
								</p>
							</div>
							<div className="flex flex-col gap-8 justify-center md:text-txt-md text-txt-sm items-center">
								<p className="text-gray font-light text-txt-sm flex gap-8">
									Haven't received it?
									<button 
										onClick={resetTimer} 
										disabled={!isActive} 
										className={`text-white underline ${isActive ? 'cursor-pointer font-bold opacity-100' : 'cursor-not-allowed opacity-50'}`}>
										Resend a new code.
									</button>
								</p>
								<span>{formatTime(timer)}</span>
							</div>
						</div>

					</div>

					<div className="bg-[url('/images/login/changepassword.jpeg')] bg-cover bg-bottom flex flex-col">
						<div className="cover-gradient grow"></div>
					</div>
					
				</div>
			</div>
		</div>
	)
}

export default TwoFA;