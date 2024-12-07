import { RxCross2 } from "react-icons/rx";
import InputFieled from "../authentication/InputField";
import UserContext from "../../context/UserContext";
import AuthContext from "../../context/AuthContext";
import { useContext } from "react";

const UpdateProfile = ({setUpdateProfile}) => {
	const contextData = useContext(UserContext);
	const authContext = useContext(AuthContext);
	return (
		<>
			<div
				onClick={() => setUpdateProfile(false)}
				className="absolute h-full left-0 right-0 bottom-0 top-0  bg-black z-[9] opacity-40"
			></div>
			<div className="fixed w-[90%] md:w-[600px] overflow-y-auto no-scrollbar max-h-[90%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col secondary-glass p-16 rounded-md">
				<form className="flex flex-col gap-32">
					<div className="flex justify-between">
						<div className="flex h-[104px] w-[104px] rounded-full bg-gray overflow-hidden">
							<img src="/images/default.jpeg" alt="" />
						</div>
						<RxCross2
							onClick={() => setUpdateProfile(false)}
							className="text-2xl cursor-pointer"
						/>
					</div>
					<div className="flex flex-wrap gap-32">
						<InputFieled
							name='firstName'
							type='text'
							value={contextData.userInfo.first_name}
							onChange={authContext.handleChange}
							placeholder='first name'
						/>
						<InputFieled
							name='lastName'
							type='text'
							value={contextData.userInfo.last_name}
							onChange={authContext.handleChange}
							placeholder='last name'
						/>
						<InputFieled
							name='username'
							type='text'
							value={contextData.userInfo.username}
							onChange={authContext.handleChange}
							placeholder='username'
						/>
						<InputFieled
							name='email'
							type='text'
							value={contextData.userInfo.email}
							onChange={authContext.handleChange}
							placeholder='email'
						/>
						<InputFieled
							name='password'
							type='password'
							placeholder='old password'
							onChange={authContext.handleChange}
							onBlur={authContext.handleBlur}
						/>
						<InputFieled
							name='password'
							type='password'
							placeholder='password'
						/>
						<textarea
							name="about"
							placeholder="about..."
							value={contextData.userInfo.about}
							className="w-full bg-transparent text-gray border-b-2 border-r-2 rounded-md border-stroke-sc outline-none resize-y min-h-64 max-h-[120px] custom-scrollbar"
						></textarea>
					</div>
					<div className="flex gap-16 items-center">
						<div className="h-[0.5px] bg-stroke-sc grow rounded-full"></div>
						<p>security</p>
						<div className="h-[0.5px] bg-stroke-sc grow rounded-full"></div>
					</div>
					<div className="flex md:gap-32 gap-16 items-center">
						(2fa) authenticaton:
						<div className="flex flex-col grow items-center">
							<div className="flex flex-col gap-8">
								<label className="flex gap-8 items-center">
									<input type="radio" name="radio" className="hidden two-fa-radio"/>
									<span>activate</span>
								</label>
								<label className="flex gap-8">
									<input type="radio" name="radio" className="hidden two-fa-radio"/>
									<span>deactivate</span>
								</label>
							</div>
						</div>
					</div>
					<button className="bg-green p-8 text-black text-lg font-bold rounded-md">save</button>
				</form>
			</div>
		</>
	)
}

export default UpdateProfile;