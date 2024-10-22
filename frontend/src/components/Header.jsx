import { useContext, useEffect, useRef, useState } from "react";
import { IoSearchOutline, IoNotificationsOutline, IoNotifications } from "react-icons/io5";
import { SlMenu } from "react-icons/sl";
import { Link } from "react-router-dom";
import Menu from "./Menu";
import OptionsSection from "./OptionsSection";
import AuthContext from "../context/AuthContext";
import { IoSettingsOutline, IoChevronBack } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";

const navLinks = ['home', 'profile', 'chat', 'rankings', 'games', 'explore'];

const Header = ({...props}) => {
	const { displayMenuGl, setDisplayMenuGl } = useContext(AuthContext);
	const [displayOptions, setDisplayOptions] = useState(false);
	const [displayNotification, setDisplayNotification] = useState(false);
	const [readNotif, setReadNotif] = useState(false);
	const optionsData = [
		{
			name: 'settings',
			icon: <IoSettingsOutline />
		},
		{
			name: 'logout',
			icon: <TbLogout2 />
		},
	];
	const notificationData = [
		"Success! Your changes have been saved.",
		"Error: Unable to connect to the server. Please try again.",
		"Reminder: Your session will expire in 5 minutes.",
		"New Message: You have a new message from [Sender Name].",
		"Update Available: A new version is now available. Please refresh to update.",
		"Warning: Your password will expire in 3 days.",
		"Account Created! Welcome to [App Name].",
		"Failed Login Attempt: Someone tried to log into your account.",
		"File Uploaded Successfully! Your file is ready to view.",
		"Subscription Alert: Your subscription is about to expire in 7 days.",
		"New Notification: You have 3 unread notifications.",
		"Action Required: Please complete your profile to access more features.",
		"Payment Successful: Your payment was processed successfully.",
		"Item Added to Cart! Continue shopping or proceed to checkout.",
		"System Maintenance: Scheduled maintenance will start at 12:00 AM.",
		"Download Ready! Your file is now available for download.",
		"Profile Updated: Your profile information has been successfully updated.",
		"Low Battery: Your device battery is below 10%.",
		"Error: Please check your internet connection and try again.",
		"Order Shipped! Your order has been shipped and is on the way."
	]
	const optionSectionRef = useRef(null);
	const toggleOptionsRef = useRef([]);

	const toggleMenu = () => {
		setDisplayMenuGl(!displayMenuGl);
	}

	const toggleNotification = () => {
		if (displayOptions)
			setDisplayOptions(false);
		setReadNotif(true);
		setDisplayNotification(!displayNotification);
	}

	const toggleOptions = () => {
		if (displayNotification)
			setDisplayNotification(false);
		setDisplayOptions(!displayOptions);
	}

	const handleClickOutside = (event) => {
		if (optionSectionRef.current && !optionSectionRef.current.contains(event.target)) {
			if (toggleOptionsRef.current[0] && !toggleOptionsRef.current[0].contains(event.target) &&
					toggleOptionsRef.current[1] && !toggleOptionsRef.current[1].contains(event.target)) {
				setDisplayOptions(false);
				setDisplayNotification(false);
			}
		}
	}

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.addEventListener('mousedown', handleClickOutside);
		}
	}, []);

	const linkes = [];
	navLinks.forEach(link => {
		let redirectLink = link;
		if (redirectLink === 'profile')
				redirectLink = 'profile/overview'
		if (props.link === link) {
			linkes.push(
				<li className="flex gap-2 flex-col justify-center" key={link}>
					<Link to={`/${redirectLink}`} className="text-white lg:text-h-lg-md font-semibold" key={link}>{link}</Link>
					<div className="h-3 rounded bg-green"></div>
				</li>
			)
		} else {
			linkes.push(
				<li className="flex flex-col justify-center" key={link}>
					<Link to={`/${redirectLink}`} className="text-white lg:text-h-lg-md font-semibold" key={link}>{link}</Link>
					<div className="h-3 hidden rounded bg-green"></div>
				</li>
			)
		}
	})

	return (
		<>
			{
				displayMenuGl && <Menu link={props.link} />
			}
			<div className="items-center w-full max-w-[1440px] z-[10000] fixed top-0 left-1/2 transform -translate-x-1/2">
				<div className="relative w-full">
					{ displayOptions && <OptionsSection data={optionsData} reference={optionSectionRef} type='options' /> }
					{ displayNotification && <OptionsSection data={notificationData} reference={optionSectionRef} type='notification' /> }
				</div>
			</div>
			<header className="backdrop-blur-3xl sticky top-0 z-[2] lg:mb-32 mb-16 lg:px-0 px-16">
				<div className="flex items-center lg:gap-32 gap-16 py-16 max-w-[1440px] m-auto lg:px-32 relative">
					<Link to='/home' className="text-white lg:text-h-md-lg text-h-sm-lg font-semibold cursor-pointer">
						<img src="/images/logo.png" alt="logo" className="w-full h-[50px]" />
					</Link>
					<nav className="lg:flex grow hidden lg:justify-center justify-end">
						<ul className="flex lg:gap-32 gap-16 itmes-center"> {linkes} </ul>
					</nav>
					<div className="flex grow justify-center">
						<div className="flex items-center relative lg:w-full md:w-[60%] w-[90%]">
							<input type="text" placeholder='find users' className='search-glass text-txt-xs px-32 py-8 outline-none text-white w-full'/>
							<IoSearchOutline className='text-gray absolute left-8 text-txt-md' />
						</div>
					</div>
					<div
						ref={(el) => (toggleOptionsRef.current[0] = el)}
						onClick={toggleNotification}
						className="relative flex items-center cursor-pointer"
					>
						{ !displayNotification && <IoNotificationsOutline className='text-white text-h-lg-lg' /> }
						{ displayNotification && <IoNotifications className='text-white text-h-lg-lg' /> }
						
						
						{ !readNotif && <span className="absolute w-10 h-10 bg-red rounded-full left-4 top-0 overflow-hidden"></span> }
					</div>
					<div
						ref={(el) => (toggleOptionsRef.current[1] = el)}
						onClick={toggleOptions}
						className="bg-gray w-32 h-32 rounded-full lg:block hidden overflow-hidden cursor-pointer"
					>
						<img src="/images/profile.png" alt="profile pic" className="w-full" />
					</div>
					<div onClick={toggleMenu} className="lg:hidden block cursor-pointer">
						<SlMenu className='text-white text-h-lg-lg'/>
					</div>
				</div>
			</header>
		</>
	)
}

export default Header;