import { IoSearchOutline, IoNotificationsOutline } from "react-icons/io5";
import { SlMenu } from "react-icons/sl";
import { Link } from "react-router-dom";

const navLinks = ['home', 'profile', 'chat', 'rankings', 'games', 'explore'];

const Header = ({...props}) => {
	const linkes = [];
	navLinks.forEach(link => {
		if (props.link === link) {
			linkes.push(
				<li className="flex gap-2 flex-col justify-center" key={link}>
					<Link to={`/${link}`} className="text-white lg:text-h-lg-md font-semibold" key={link}>{link}</Link>
					<div className="h-3 rounded bg-green"></div>
				</li>
			)
		} else {
			linkes.push(
				<li className="flex flex-col justify-center" key={link}>
					<Link to={`/${link}`} className="text-white lg:text-h-lg-md font-semibold" key={link}>{link}</Link>
					<div className="h-3 hidden rounded bg-green"></div>
				</li>
			)
		}
	})

	return (
		<header className="backdrop-blur-3xl sticky top-0 z-[2] lg:mb-32 mb-16 lg:px-32 px-16">
			<div className="flex items-center lg:gap-32 gap-16 py-16 md:px-0 px-16 max-w-[1440px] m-auto lg:px-32 px-16">
				<Link to='/home' className="text-white lg:text-h-md-lg text-h-sm-lg font-semibold cursor-pointer">
					<img src="images/logo.png" alt="logo" className="w-full h-[50px]" />
					{/* Ad. <span className="text-green">Ture</span> */}
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
				<div className="relative flex items-center">
					<IoNotificationsOutline className='text-white text-h-lg-lg' />
					<span className="absolute w-10 h-10 bg-red rounded-full left-4 top-0 overflow-hidden"></span>
				</div>
				<div className="bg-gray w-32 h-32 rounded-full lg:block hidden overflow-hidden">
					<img src="images/profile.png" alt="profile pic" className="w-full" />
				</div>
				<div className="lg:hidden block">
					<SlMenu className='text-white text-h-lg-lg'/>
				</div>
			</div>
		</header>
	)
}

export default Header;