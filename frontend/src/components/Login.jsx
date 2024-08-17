import { Si42 } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
	return (
		<>
		<div className="container">
			<div className="md:py-32 py-16 grow flex flex-col">
				<div className="lg:grid lg:grid-cols-[1fr_1fr] primary-glass overflow-hidden flex flex-col grow">
					<div className="md:px-64 px-16 flex flex-col justify-center md:gap-32 gap-24 lg:py-64 py-32 grow">
						<div className="flex flex-col gap-8">
							<h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">Welcome back, Player</h1>
							<p className="md:text-txt-lg text-txt-sm">Welcome back! Please enter your details</p>
						</div>
						<form className="md:py-32 py-16 flex flex-col md:gap-32 gap-16">
							<input type="text" required className="py-16 login-input border-b-2 border-stroke-sc" placeholder="Email or username"/>
							<input type="text" required className="py-16 login-input border-b-2 border-stroke-sc" placeholder="Password"/>
							<div className="flex justify-end">
								<a href="#" className="underline">forget password?</a>
							</div>
							<button className="bg-green text-black font-bold py-8 rounded">Log In</button>
							<div className="flex gap-8 justify-center md:text-txt-md text-txt-sm">
								<p className="">don't have an account?</p>
								<a href="#" className="font-bold">Sign up</a>
							</div>
						</form>
						<div className="flex gap-16 items-center">
							<hr className="grow text-stroke-sc" />
							<p className="">or</p>
							<hr className="grow text-stroke-sc" />
						</div>
						<a href="#" className="flex gap-16 py-8 justify-center items-center rounded border border-stroke-sc">
							<Si42 className="text-txt-3xl"/>
							<p className="">log in with intra</p>
						</a>
						<a href="#" className="flex gap-16 py-8 justify-center items-center rounded border border-stroke-sc">
							<FcGoogle className="text-txt-3xl"/>
							<p>log in with intra</p>
						</a>
					</div>
					<div className="bg-[url('/images/login/login.jpeg')] bg-cover flex flex-col">
						<div className="cover-gradient grow"></div>
					</div>
				</div>
			</div>
		</div>
		</>
	)
}

export default Login