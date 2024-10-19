import AuthContext from "../../context/AuthContext";
import InputFieled from "../../components/InputField";
import { useContext, useState } from "react";
import { useParams } from 'react-router-dom'

const ResetPassword = () => {
	const {handleBlur, handleChange, error} = useContext(AuthContext);
	let { uid, token } = useParams();

	return (
		<div className="grow">
			<div className="absolute min-h-screen w-screen backdrop-blur-xl"></div>
			<div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
				<div className="lg:grid lg:grid-cols-[1fr_1fr] login-glass overflow-hidden flex flex-col grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
					<div className="md:px-64 px-32 flex flex-col justify-center md:gap-32 gap-24 lg:py-64 py-32 grow">
						<div className="flex flex-col gap-8">
							<h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">Reset Password</h1>
							<p className="md:text-txt-lg text-txt-sm">change your password</p>
						</div>

						<form className="md:py-32 py-16 flex flex-col gap-48">

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

					</div>

					<div className="bg-[url('/images/login/changepassword.jpeg')] bg-cover bg-bottom flex flex-col">
						<div className="cover-gradient grow"></div>
					</div>
					
				</div>
			</div>
		</div>
	)
}

export default ResetPassword;