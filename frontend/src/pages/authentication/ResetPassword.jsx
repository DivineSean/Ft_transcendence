import InputFieled from "../../components/authentication/InputField";
import { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "../../context/AuthContext";
import { useParams } from 'react-router-dom'
import TwoFaInput from "../../components/authentication/TwoFaInput";

const ResetPassword = () => {
	const {

		error,
		handleBlur,
		handleChange,
		resent2FACode,
		changePassword,

	} = useContext(AuthContext);
	const [timer, setTimer] = useState(5);
	const [isActive, setIsActive] = useState(false);
	const [values2FA, setValues2FA] = useState(Array(6).fill(''));
	// const inputs = useRef([]);

	// const handleChange2FA = (e, index) => {
	// 	const value = e.target.value;
	// 	if (/^[0-9]$/.test(value)) {
	// 		const newValues = [...values2FA];
	// 		newValues[index] = value;
	// 		setValues2FA(newValues);
	// 		if (index < 5 && value) {
	// 			inputs.current[index + 1].focus();
	// 		}
	// 	}
	// };

	// const handleKeyDown2FA = (e, index) => {
	// 	if (e.key === 'Backspace') {
	// 		const newValues = [...values2FA];
	// 		if (newValues[index]) {
	// 			newValues[index] = '';
	// 			setValues2FA(newValues);
	// 		} else if (index > 0) {
	// 			inputs.current[index - 1].focus();
	// 			const prevValues = [...values2FA];
	// 			prevValues[index - 1] = '';
	// 			setValues2FA(prevValues);
	// 		}
	// 	}
	// }

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

	const resetTimer = (type) => {
		resent2FACode(uid, type);
		setTimer(5);
		setIsActive(false);
	}

	const { uid } = useParams();

	return (
		<>
			<div className="flex flex-col gap-8">
				<h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">Reset Password</h1>
				<p className="md:text-txt-md text-txt-sm text-gray">the email sent seccessfuly check your mail to change your password</p>
			</div>

			<form onSubmit={(e) => changePassword(e, uid, values2FA)} className="md:py-32 py-16 flex flex-col gap-48">
				<div className="flex flex-col gap-10">
					<InputFieled name="password" type="password" placeholder="Password" onChange={handleChange} onBlur={handleBlur} error={error.password} />
					{error.password && <span className="text-red text-txt-sm">{error.password}</span>}
				</div>

				<div className="flex flex-col gap-10">
					<InputFieled name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} onBlur={handleBlur} error={error.confirmPassword} />
					{error.confirmPassword && <span className="text-red text-txt-sm">{error.confirmPassword}</span>}
				</div>
				<TwoFaInput type='reset' saveValues={setValues2FA} />

				<button type="submit" className="bg-green text-black text-h-sm-lg font-bold py-8 rounded">Send</button>
				<div className="flex flex-col gap-8 justify-center md:text-txt-md text-txt-sm items-center">
					<p className="text-gray font-light text-txt-sm flex gap-8">
						Haven't received it?
						<button 
							onClick={() => resetTimer('reset')} 
							disabled={!isActive} 
							className={`text-white underline ${isActive ? 'cursor-pointer font-bold opacity-100' : 'cursor-not-allowed opacity-50'}`}>
							Resend a new code.
						</button>
					</p>
					<span>{formatTime(timer)}</span>
				</div>
			</form>
		</>
	)
}

export default ResetPassword;