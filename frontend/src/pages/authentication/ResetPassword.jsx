import AuthContext from "../../context/AuthContext";
import InputFieled from "../../components/InputField";
import { useContext, useState, useEffect } from "react";
import { useParams } from 'react-router-dom'

const ResetPassword = () => {
	const {

		error,
		inputs,
		values2FA,
		handleBlur,
		handleChange,
		handleChange2FA,
		handleKeyDown2FA,
		changePassword

	} = useContext(AuthContext);

	const { uid } = useParams();

	return (
		<>
			<div className="flex flex-col gap-8">
				<h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">Reset Password</h1>
				<p className="md:text-txt-md text-txt-sm text-gray">the email sent seccessfuly check your mail to change your password</p>
			</div>

			<form onSubmit={(e) => changePassword(e, uid)} className="md:py-32 py-16 flex flex-col gap-48">
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
				<div className="flex flex-col gap-10">
					<InputFieled name="password" type="password" placeholder="Password" onChange={handleChange} onBlur={handleBlur} error={error.password} />
					{error.password && <span className="text-red text-txt-sm">{error.password}</span>}
				</div>

				<div className="flex flex-col gap-10">
					<InputFieled name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} onBlur={handleBlur} error={error.confirmPassword} />
					{error.confirmPassword && <span className="text-red text-txt-sm">{error.confirmPassword}</span>}
				</div>

				<button type="submit" className="bg-green text-black text-h-sm-lg font-bold py-8 rounded">Send</button>

			</form>
		</>
	)
}

export default ResetPassword;