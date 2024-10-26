import AuthContext from "../../context/AuthContext";
import InputFieled from "../../components/InputField";
import { useContext, useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom'
import Toast from "../../components/Toast";

const ResetPassword = () => {
	const {

		error,
		handleBlur,
		handleChange,
		changePassword,

	} = useContext(AuthContext);

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
				<div className="flex flex-col gap-16">
					<p className="text-gray">enter the code </p>
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
				</div>

				<button type="submit" className="bg-green text-black text-h-sm-lg font-bold py-8 rounded">Send</button>

			</form>
		</>
	)
}

export default ResetPassword;