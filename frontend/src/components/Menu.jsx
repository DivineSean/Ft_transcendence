import { IoChatbubbleEllipsesOutline, IoSettingsOutline, IoChevronBack } from "react-icons/io5";
import { MdOutlineExplore } from "react-icons/md";
import AuthContext from "../context/AuthContext";
import { RiGamepadLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import { PiRanking } from "react-icons/pi";
import { Link } from "react-router-dom";
import { GoHome } from "react-icons/go";
import { useContext } from "react";

const navLinks = [
	{
		name: 'home',
		icon: <GoHome />
	},
	{
		name: 'profile',
		icon: <FaRegUser />
	},
	{
		name: 'chat',
		icon: <IoChatbubbleEllipsesOutline />
	},
	{
		name: 'rankings',
		icon: <PiRanking />
	},
	{
		name: 'games',
		icon: <RiGamepadLine />
	},
	{
		name: 'explore',
		icon: <MdOutlineExplore />
	},
	{
		name: 'settings',
		icon: <IoSettingsOutline />
	},
];

const Menu = ({...props}) => {

	const { displayMenuGl, setDisplayMenuGl, logout } = useContext(AuthContext);

	const links = [];
	navLinks.forEach(link => {
		if (props.link === link.name) {
			links.push(
				<Link to={`/${link.name}`} key={link.name} className="font-semibold hover-secondary rounded-md">
					<li className="p-16 flex items-center gap-16 text-h-sm-sm" key={link}>
						{link.icon}
						{link.name}
					</li>
				</Link>
			)
		} else {
			links.push(
				<Link to={`/${link.name}`} onClick={() => setDisplayMenuGl(false)} key={link.name} className="hover:hover-secondary rounded-md font-semibold">
					<li className="p-16 flex items-center gap-16 text-h-sm-sm" key={link}>
						{link.icon}
						{link.name}
					</li>
				</Link>
			)
		}
	})

	window.addEventListener('resize', () => {
		if (window.innerWidth >= 1100) {
			setDisplayMenuGl(false)
		}
	})

	const toggleDisplay = () => {
		setDisplayMenuGl(!displayMenuGl);
		console.log(props.isDisplayed);
	}

	return (
		<div className="fixed primary-glass-no-rounded max-h-screen p-16 text-white gap-32 overflow-y-scroll no-scrollbar lg:hidden flex flex-col absolute z-[100] right-0 left-0 bottom-0 top-0">
			<div className="flex px-16 py-8 justify-between secondary-glass items-center ">
				<div className="flex gap-16 overflow-hidden">
					<div className="w-64 h-64 bg-gray rounded-full overflow-hidden">
						<img src="/images/profile.png" alt="profile" className="w-full" />
					</div>
					<div className="flex flex-col justify-center">
						<h2 className="text-h-sm-sm font-semibold">Simhammed stoune</h2>
						<p className="text-txt-xs">@sistoune</p>
					</div>
				</div>
				<IoChevronBack onClick={toggleDisplay} className="text-txt-3xl cursor-pointer"/>
			</div>
			<ul className="flex flex-col gap-8">
				{links}
			</ul>
			<div className="grow md:block hidden"></div>
			<div onClick={logout} className="menu-linkes flex p-16 gap-16 text-h-sm-sm rounded-md items-center hover:bg-logout-bg">
					<TbLogout2 />
					logout
			</div>
		</div>
	)
}

export default Menu;