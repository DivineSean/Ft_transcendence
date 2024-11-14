import InputFieled from "../../components/authentication/InputField";
import AuthContext from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import ResetPassword from "./ResetPassword";
import Toast from "../../components/Toast";
import { Link } from "react-router-dom";
import { useContext } from "react";

const ForgotPassword = () => {
	const { uid } = useParams();
	const {
		error,
		handleBlur,
		handleChange,
		globalMessage,
		setGlobalMessage,
		requestResetPassword
	} = useContext(AuthContext);

	return (
		<div className="grow">
			{globalMessage.message &&
				<Toast
					message={globalMessage.message}
					error={globalMessage.isError}
					onClose={setGlobalMessage}
				/>
			}
			<div className="absolute min-h-screen w-screen backdrop-blur-xl"></div>
			<div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
				<div className="lg:grid lg:grid-cols-[1fr_1fr] login-glass overflow-hidden flex flex-col grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
					<div className="bg-[url('/images/login/forgot.jpeg')] bg-cover bg-bottom flex flex-col">
						<div className="cover-gradient grow"></div>
					</div>
					<div className="md:px-64 px-32 flex flex-col justify-center md:gap-32 gap-24 lg:py-64 py-32 grow">
						{!uid &&
							<>
								<div className="flex flex-col gap-8">
									<h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">forgot password!</h1>
									<p className="md:text-txt-lg text-txt-sm">reset your password</p>
								</div>

								<form onSubmit={(e) => requestResetPassword(e)} className="md:py-32 py-16 flex flex-col gap-48">

									<div className="flex flex-col gap-10">
										<InputFieled name="email" type="email" placeholder="Example@gmail.com" onChange={handleChange} onBlur={handleBlur} error={error.email} />
										{error.email && <span className="text-red text-txt-sm">{error.email}</span>}
									</div>

									<button type="submit" className="bg-green text-black text-h-sm-lg font-bold py-8 rounded">Send</button>
									
									<div className="flex gap-8 justify-center md:text-txt-md text-txt-sm">
										<p className="">did you remember your password?</p>
										<Link to='/login' className="font-bold">log in</Link>
									</div>

								</form>
							</>
						} 
						{uid &&
							<ResetPassword />
						}
					</div>
				</div>
			</div>
		</div>
	)
}

export default ForgotPassword;