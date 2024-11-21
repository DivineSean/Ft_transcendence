import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { BiSolidSend } from "react-icons/bi";
import { useNavigate } from "react-router-dom";


const Message = ({...props}) => {
	if (props.side === 'right') {
		return (
			<div className="flex gap-8 items-end">
				<div className="grow"></div>
				<div className="message-glass p-8 rounded-[8px] rounded-br-[2px] max-w-[450px] text-gray text-sm tracking-wider">
					{props.message}
				</div>
				<div className="min-w-16 min-h-16 max-w-16 object-cover max-h-16 overflow-hidden flex rounded-full">
					<img src="/images/profile.png" alt="p" />
				</div>
			</div>
		)

	} else {
		
		return (
			<div className="flex gap-8 items-end">
				<div className="min-w-16 min-h-16 max-w-16 object-cover max-h-16 overflow-hidden flex rounded-full">
					<img src="/images/profile.png" alt="p" />
				</div>
				<div className="message-glass p-8 rounded-[8px] rounded-bl-[2px] max-w-[450px] text-gray text-sm tracking-wider">
					{props.message}
				</div>
			</div>
		)

	}
}

const Conversation = ({uid, displayProfile, hideSelf}) => {

	const navigate = useNavigate();
	const conversation = [];
	for (let i = 0; i < 40; i++) {
		if (i % 2) {
			conversation.push(
				<Message
					key={i}
					side='left' 
					message='
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
						incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
						exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
						dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
						Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
						mollit anim id est laborum.
					'
				/>
			)
		}
		else 
			conversation.push(
				<Message
					key={i}
					side='right'
					message='
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
						incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
						exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
						dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
						Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
						mollit anim id est laborum.
					'
				/>
			)
	}
	const goToProfileSide = () => {
		displayProfile(true);
		hideSelf(false);
	}
	return (
		<div
			className={`
				grow md:flex flex-col gap-32
				${uid ? 'flex' : 'hidden'}
			`}
		>
			<div className="border-b-[0.5px] border-stroke-sc pb-16 flex justify-between items-center">
				<div className="flex gap-16 items-center">
					<IoArrowBackOutline onClick={() => navigate(-1)} className="md:hidden block text-txt-xl cursor-pointer"/>
					<div className={`md:w-56 md:h-56 h-48 w-48 rounded-full border overflow-hidden border-green`}>
						<img src="/images/profile.png" alt="profile" />
					</div>
					<div className="flex flex-col justify-between h-full">
						<h2 className="md:text-h-sm-md text-h-sm-sm font-bold">devon lane</h2>
						<p className="md:text-txt-md text-txt-xs text-green">online</p>
					</div>
				</div>
				<IoIosInformationCircleOutline
					className="md:hidden block text-txt-2xl cursor-pointer"
					onClick={goToProfileSide}
				/>
			</div>
			<div className="h-14 flex grow flex-col-reverse gap-16 overflow-y-scroll no-scrollbar">
				{conversation}
			</div>
			<div className="flex items-center relative">
				<input type="text" placeholder='Aa...' className='send-glass text-txt-md px-16 pr-56 py-12 outline-none text-white w-full grow'/>
				<BiSolidSend className='text-gray absolute right-16 text-txt-3xl cursor-pointer hover:text-green' />
			</div>
		</div>
	)
}

export default Conversation;