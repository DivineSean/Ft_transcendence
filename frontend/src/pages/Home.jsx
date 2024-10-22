import Header from "../components/Header";
import SideOnlineFriends from "../components/home/SideOnlineFriends";
import Card from "../components/home/Card";
import OnlineMatches from "../components/home/OnlineMatches";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const Home = () => {
	const { displayMenuGl } = useContext(AuthContext);
	const friends = [];
	for (let i = 0; i < 105; i++) {
		if (i === 0)
			friends.push(<SideOnlineFriends key={i} isOnline={true} isSend={true} messageNumber={4}/>)
		else if (i === 1)
			friends.push(<SideOnlineFriends key={i} isOnline={false} isSend={true} messageNumber={10}/>)
		else
			friends.push(<SideOnlineFriends key={i} isOnline={true} isSend={false}/>)
	}

	return (
		<div className="flex flex-col grow">
			<Header link='home' />
			{
				!displayMenuGl &&
				<div className="container">
					<section className="flex lg:gap-32 gap-16 justify-end">
						<div className="backdrop-blur-sm w-full h-full absolute top-0 right-0 z-[-1]"></div>
						<article className="flex flex-col gap-32 grow">
							<div className="grid lg:grid-cols-[1.1fr_1fr] lg:gap-32 gap-16">
								<Card 
									title='welcome back,'
									name='simhammed'
									description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
									isModel={false}
									isMainButton={true}
									buttonContent='play now'
									imgSrc='images/bmo.png'
								/>
								<Card 
									title='explore the'
									name='world'
									description='Here you can explore our world to meet more friends to play or talk with'
									isModel={true}
									isMainButton={false}
									buttonContent='explore'
									imgSrc='images/bmo.png'
								/>
							</div>
							<div className="grid lg:grid-cols-[1fr_1.1fr] lg:gap-32 gap-16">
								<OnlineMatches />
								<OnlineMatches />
							</div>
							<div className="primary-glass"></div>
						</article>
						<div className="min-w-[83px] lg:flex hidden"></div>
						<article className="fixed side-online-friends-container py-16 primary-glass lg:flex hidden flex-col gap-16 items-center ">
							<div className="px-8 custom-scrollbar overflow-y-scroll">
								{friends}
							</div>
						</article>
					</section>
				</div>
			}
		</div>
	)
}

export default Home;