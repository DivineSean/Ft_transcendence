import { RxCross2 } from "react-icons/rx";
import InputFieled from "../authentication/InputField";
import UserContext from "../../context/UserContext";
import AuthContext from "../../context/AuthContext";
import { useContext, useEffect, useRef, useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";


import { PiEyeClosedBold, PiEyeBold } from "react-icons/pi";
import { BACKENDURL } from "../../utils/fetchWrapper";

const InputUpdateProfile = ({...props}) => {
	const isPassword = props.type === 'password';
	const [display, setDisplay] = useState(false);
	const inputRef = useRef()
	return (
		<div className="relative flex items-center grow w-full">
			{!isPassword
				?
				<>
					{props.type !== 'about' &&
						<>
							<input
								defaultValue={props.value}
								ref={inputRef}
								onChange={props.onChange}
								name={props.name}
								type={props.type}
								className="
									peer outline-none bg-transparent grow border border-stroke-sc
									rounded-sm text-txt-sm font-light p-8 focus:border-gray transition-all
								"
							/>
							<label
								className={`
									absolute top-1/2 -translate-y-1/2
									${props.formData ? 'top-[-8px] left-0 text-txt-xs' : 'left-8 text-txt-sm' } text-gray
									transition-all peer-focus:left-0 peer-focus:text-txt-xs peer-focus:top-[-8px]
								`}
							> {props.title} </label>
						</>
					}
				</>
				:
				<>
					<input
						onChange={props.onChange}
						name={props.name}
						type={display ? 'text' : 'password'}
						className="
							peer outline-none bg-transparent pr-32 grow border border-stroke-sc rounded-sm text-txt-sm
							font-light p-8 focus:border-gray transition-all
						"
					/>
					<label
						className={`
							absolute top-1/2 -translate-y-1/2
							${props.formData ? 'top-[-8px] left-0 text-txt-xs' : 'left-8 text-txt-sm' } text-gray
							transition-all peer-focus:left-0 peer-focus:text-txt-xs peer-focus:top-[-8px]
						`}
					> {props.title} </label>
					{!display &&
						<PiEyeClosedBold
							className="text-gray text-txt-xl cursor-pointer absolute right-8"
							onClick={() => setDisplay(true)}
						/>
					}
					{display &&
						<PiEyeBold
							className="text-gray text-txt-xl cursor-pointer absolute right-8"
							onClick={() => setDisplay(false)}
						/>
					}
				</>
			}
			{props.type === 'about' &&
				<>
					<textarea
						name={props.name}
						defaultValue={props.value}
						onChange={props.onChange}
						className="
							bg-transparent border border-stroke-sc rounded-sm min-w-full outline-none
							h-[100px] custom-scrollbar resize-none p-8 peer grow text-txt-sm font-light
							focus:border-gray transition-all
						"
					></textarea>
					<label
						className={`
							absolute text-gray -translate-y-1/2 
							${props.formData ? 'top-[-8px] left-0 text-txt-xs' : 'left-8 top-24 text-txt-sm' }
							transition-all peer-focus:left-0 peer-focus:text-txt-xs peer-focus:top-[-8px]
						`}
					> {props.title} </label>
				</>
			}
		</div>
	)
}

const UpdateProfile = ({setUpdateProfile}) => {
	const contextData = useContext(UserContext);
	const [isChecked, setIsChecked] = useState(contextData && contextData.userInfo.isTwoFa ? true : false);
	const [image, setImage] = useState(
		contextData && contextData.userInfo.profile_image
		? BACKENDURL + contextData.userInfo.profile_image
		: '/images/default.jpeg'
	);

	const [formData, setFormData] = useState({
    firstName: contextData.userInfo.first_name,
    lastName: contextData.userInfo.last_name,
    username: contextData.userInfo.username,
    email: contextData.userInfo.email,
    oldPassword: "",
    newPassword: "",
		confirmPassword: "",
		about: contextData.userInfo.about,
  });


	const handleChange = (e) => {
    let { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const imageUrl = URL.createObjectURL(file);
			setImage(imageUrl);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(e);
		console.log(formData, isChecked, image);
	}


	return (
		<>
			<div
				onClick={() => setUpdateProfile(false)}
				className="absolute h-full left-0 right-0 bottom-0 top-0  bg-black z-[9] opacity-60"
			></div>
			<div className="fixed w-[90%] gap-16 md:w-[600px] overflow-y-auto no-scrollbar max-h-[90%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col secondary-glass p-16 rounded-md">
				<div className="flex justify-between text-gray">
					<p className="font-bold tracking-wide">edit your profile</p>
					<RxCross2
						onClick={() => setUpdateProfile(false)}
						className="text-2xl cursor-pointer"
					/>
				</div>
				<form className="flex flex-col gap-32" onSubmit={handleSubmit}>
					<div className="flex gap-16">
						<div
							className={`h-[100px] w-[100px] rounded-full bg-center bg-cover overflow-hidden border border-stroke-sc`}
							style={{ backgroundImage: `url(${image})` }}
						></div>
						<div className="flex flex-col gap-16 justify-end">
							<h2 className="text-sm text-gray font-semibold">change profile picture</h2>
							<input
								type="file"
								id="file-upload"
								className="hidden"
								accept=".jpeg, .png, .jpg"
								onChange={handleFileChange}
							/>
							<label
								htmlFor="file-upload"
								className="
									flex items-center justify-center px-16 py-4 text-gray bg-stroke-pr gap-16
									rounded-sm cursor-pointer hover:bg-stroke-sc transition border border-stroke-sc
								"
							>
								<p>Upload image</p>
								<IoCloudUploadOutline className="text-lg text-green" />
							</label>
						</div>
					</div>

					<div className="flex flex-col gap-32">
						<InputUpdateProfile
							formData={formData.firstName}
							onChange={handleChange}
							title='first name'
							type='text'
							value={formData.firstName}
							name='firstName'
						/>
						<InputUpdateProfile
							formData={formData.lastName}
							value={formData.lastName}
							onChange={handleChange}
							title='last name'
							type='text'
							name='lastName'
						/>
						<InputUpdateProfile
							formData={formData.username}
							value={formData.username}
							onChange={handleChange}
							title='username'
							type='text'
							name='username'
						/>
						<InputUpdateProfile
							formData={formData.email}
							value={formData.email}
							onChange={handleChange}
							title='email'
							type='email'
							name='email'
						/>
						<InputUpdateProfile
							formData={formData.about}
							value={formData.about}
							onChange={handleChange}
							title='about'
							type='about'
							name='about'
						/>
					</div>

					<div className="flex gap-16 items-center">
						<div className="h-[0.5px] bg-stroke-sc grow rounded-full"></div>
						<p>security</p>
						<div className="h-[0.5px] bg-stroke-sc grow rounded-full"></div>
					</div>

					<div className="flex md:gap-32 gap-16 items-center justify-center">
						two-factor authentication
						<label className="inline-flex items-center cursor-pointer">
							<input
								checked={isChecked}
								onChange={(e) => setIsChecked(e.target.checked)}
								type="checkbox"
								className="sr-only peer"
							/>
							<div
								className="
									relative w-11 h-6 peer-focus:outline-none 
									peer-focus:border-green rounded-full bg-stroke-sc
									peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
									peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
									after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full
									after:h-5 after:w-5 after:transition-all peer-checked:bg-green
								"
							></div>
						</label>
					</div>
					<div className="flex flex-wrap gap-32">
						
						<InputUpdateProfile
							formData={formData.oldPassword}
							onChange={handleChange}
							title='old password'
							type='password'
							name='oldPassword'
						/>
						<InputUpdateProfile
							formData={formData.newPassword}
							onChange={handleChange}
							title='new password'
							type='password'
							name='newPassword'
						/>
						<InputUpdateProfile
							formData={formData.confirmPassword}
							onChange={handleChange}
							title='confirm password'
							type='password'
							name='confirmPassword'
						/>
					</div>
					<button className="bg-green p-8 text-black text-lg font-bold rounded-sm">save</button>
				</form>
			</div>
		</>
	)
}

export default UpdateProfile;