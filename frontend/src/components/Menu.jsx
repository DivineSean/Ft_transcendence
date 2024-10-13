import { GoHome } from "react-icons/go";
import { FaRegUser } from "react-icons/fa";
import { IoChatbubbleEllipsesOutline, IoSettingsOutline } from "react-icons/io5";
import { PiRanking } from "react-icons/pi";
import { RiGamepadLine } from "react-icons/ri";
import { MdOutlineExplore } from "react-icons/md";
import { TbLogout2 } from "react-icons/tb";

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
	const links = [];
	navLinks.forEach(link => {
		if (props.link === link.name) {
			links.push(
				<a href="#" key={link.name} className="font-semibold secondary-glass">
					<li className="p-16 flex items-center gap-16 text-h-sm-lg" key={link}>
						{link.icon}
						{link.name}
					</li>
				</a>
			)
		} else {
			links.push(
				<a href="#" key={link.name} className="menu-linkes font-semibold">
					<li className="p-16 flex items-center gap-16 text-h-sm-lg" key={link}>
						{link.icon}
						{link.name}
					</li>
				</a>
			)
		}
})
	return (
		<div className="humberger-menu primary-glass min-h-screen p-16 text-white gap-32 flex flex-col grow absolute z-[100] right-0 left-0">
			<div className="secondary-glass px-16 py-8 flex gap-16 overflow-hidden">
				<div className="w-64 h-64 bg-gray rounded-full overflow-hidden">
					<img src="images/profile.png" alt="profile" className="w-full" />
				</div>
				<div className="flex flex-col justify-center">
					<h2 className="text-h-sm-sm font-semibold">Simhammed stoune</h2>
					<p className="text-txt-xs">@sistoune</p>
				</div>
			</div>
			<ul className="flex flex-col gap-16">
				{links}
			</ul>
			<div className="grow md:block hidden"></div>
			<a href="#" className="menu-linkes flex p-16 gap-16 text-h-sm-lg items-center">
					<TbLogout2 />
					logout
			</a>
		</div>
	)
}

export default Menu;