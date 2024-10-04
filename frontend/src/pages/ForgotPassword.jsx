import AuthContext from "../context/AuthContext";
import InputFieled from "../components/InputField";
import { useContext, useState, useEffect } from "react";
import Cookies from 'js-cookie'

const ForgotPassword = () => {
	const { handleBlur, handleChange, error} = useContext(AuthContext);
	const [sent, setSent] = useState(false);


	// console.log(Cookies.get('csrftoken'));

	const send = async (e) => {
		e.preventDefault();

		console.log('hello');
		console.log(e.target.email.value);
		const response = await fetch('https://localhost:8000/api/reset_password', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': Cookies.get('csrftoken'),
			},
			body: JSON.stringify({
				'email': e.target.email.value
			}),
			redirect: 'follow'
		});
		// const response = await fetch('https://localhost:8000/api/reset_password', {
		// 	method: 'POST',
		// 	credentials: 'include',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 		'X-CSRFToken': Cookies.get('csrftoken'),
		// 	},
		// 	body: JSON.stringify({
		// 		'email': e.target.email.value,
		// 	})
		// });
		console.log(response);
		if (response.ok) {
			console.log('all good');
			const resetResponse = await fetch('https://localhost:8000/api/password_reset_done', {
				method: 'GET',
				credentials: 'include',
				headers: {
					// 'Content-Type': 'application/json',
					'X-CSRFToken': Cookies.get('csrftoken'),
				},
				// body: JSON.stringify({
				// 	'email': e.target.email.value,
				// })
			})
			console.log(resetResponse);
			setSent(true);
		}
	}

	return (
		<>
			<div className="absolute min-h-screen w-screen backdrop-blur-xl"></div>
			<div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
				<div className="lg:grid lg:grid-cols-[1fr_1fr] login-glass overflow-hidden flex flex-col grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
					<div className="bg-[url('/images/login/forgot.jpeg')] bg-cover bg-bottom flex flex-col">
						<div className="cover-gradient grow"></div>
					</div>
					<div className="md:px-64 px-32 flex flex-col justify-center md:gap-32 gap-24 lg:py-64 py-32 grow">
						<div className="flex flex-col gap-8">
							<h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">forgot password!</h1>
							<p className="md:text-txt-lg text-txt-sm">reset your password</p>
						</div>

						{!sent &&
							<form onSubmit={send} className="md:py-32 py-16 flex flex-col gap-48">

								<div className="flex flex-col gap-10">
									<InputFieled name="email" type="text" placeholder="Example@gmail.com" onChange={handleChange} onBlur={handleBlur} error={error.email} />
									{error.email && <span className="text-red text-txt-sm">{error.email}</span>}
								</div>

								<button type="submit" className="bg-green text-black text-h-sm-lg font-bold py-8 rounded">Send</button>

							</form>
						} 
						{sent &&
							<div className="md:py-32 py-16 flex flex-col gap-48">
								<p>the email sent seccessfuly check your mail to change your password or go back to login page.</p>
							</div>
						}
					</div>

				</div>
			</div>
		</>
	)
}

export default ForgotPassword;