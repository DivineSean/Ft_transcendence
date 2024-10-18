import AuthContext from "../../context/AuthContext";
import InputFieled from "../../components/InputField";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom'

const TwoFA = () => {
	// const [values, setValues] = useState(Array(6).fill(''));
	// const inputs = useRef([]);
	const { handleChange2FA, handleKeyDown2FA, inputs, values2FA, authorization2FA } = useContext(AuthContext);

	// const handleChange = (e, index) => {
	// 	const value = e.target.value;
	// 	if (/^[0-9]$/.test(value)) {
	// 		const newValues = [...values];
	// 		newValues[index] = value;
	// 		setValues(newValues);
	// 		if (index < 5 && value) {
	// 			inputs.current[index + 1].focus();
	// 		}
	// 	}
	// };

	// const handleKeyDown = (e, index) => {
	// 	if (e.key === 'Backspace') {
	// 		const newValues = [...values];
	// 		if (newValues[index]) {
	// 			newValues[index] = '';
	// 			setValues(newValues);
	// 		} else if (index > 0) {
	// 			inputs.current[index - 1].focus();
	// 			const prevValues = [...values];
	// 			prevValues[index - 1] = '';
	// 			setValues(prevValues);
	// 		}
	// 	}
	// }

	return (
		<div className="grow">
			<div className="absolute min-h-screen w-screen backdrop-blur-xl"></div>
			<div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
				<div className="lg:grid lg:grid-cols-2 login-glass overflow-hidden flex flex-col grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
					<div className="md:px-64 px-32 flex flex-col justify-center md:gap-32 gap-24 lg:py-64 py-32 grow">
						<div className="flex flex-col gap-8">
							<h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">Authenticate Your Account</h1>
							<p className="md:text-txt-md text-txt-sm text-gray lg:w-full max-w-[600px]">Protecting your account is our top priority. Please confirm  your account by entering the authorization code sent to</p>
						</div>
						<form onSubmit={authorization2FA} className="md:py-32 py-16 flex flex-col gap-48">
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
										className="bg-transparent outline-none text-center border-b-2 border-stroke-sc w-64 focus:border-green"
									/>
								))}
							</div>

							<button type="submit" className="bg-green text-black text-h-sm-lg font-bold py-8 rounded">Verify</button>
							
							<div className="flex gap-8 justify-center md:text-txt-md text-txt-sm">
								<p className="text-gray font-light text-txt-sm">It may take a minute to receive your code.</p>
							</div>
							
						</form>

					</div>

					<div className="bg-[url('/images/login/changepassword.jpeg')] bg-cover bg-bottom grow lg:flex hidden flex-col">
						<div className="cover-gradient grow"></div>
					</div>
					
				</div>
			</div>
		</div>
	)
}

export default TwoFA;