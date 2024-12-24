import SideOnlineFriends from "../components/home/SideOnlineFriends";
import OnlineMatches from "../components/home/OnlineMatches";
import AuthContext from "../context/AuthContext";
import Card from "../components/home/Card";
import Header from "../components/Header";
import { useContext, useEffect } from "react";
import UserContext from "../context/UserContext";
import LoadingPage from "./LoadingPage";

const Home = () => {
	const authContextData = useContext(AuthContext);
	const userContextData = useContext(UserContext);
	const friends = [];
		useEffect(() => {
			userContextData.getFriends();
		}, []);

	if (userContextData.userFriends && userContextData.userFriends.friends) {
		userContextData.userFriends.friends.map((friend) => {
			friends.push(<SideOnlineFriends key={friend.id} friend={friend} />)
		})
	}

	return (
		<div className="flex flex-col grow lg:gap-32 gap-16">
			<Header link="home" />
			{userContextData.generalLoading && <LoadingPage />}
			{!userContextData.generalLoading && (
				<>
					{!authContextData.displayMenuGl && (
						<div className="container px-16">
							<section className="flex lg:gap-32 gap-16 justify-end">
								<div className="backdrop-blur-sm w-full h-full absolute top-0 right-0 z-[-1]"></div>
									<article className="flex flex-col gap-32 grow">
										<div className="grid lg:grid-cols-[1.1fr_1fr] lg:gap-32 gap-16">
											<Card
											title="welcome back,"
											name={
												userContextData.userInfo &&
												userContextData.userInfo.first_name
											}
											description={`
												Welcome to Advanture Time! As a new member, you have joined a community of passionate individuals. Let's inspire and support each other.
											`}
											isModel={false}
											isMainButton={true}
											buttonContent="play now"
											imgSrc="images/bmo.png"
											/>
											<Card
											title="explore the"
											name="world"
											description="Here you can explore our world to meet more friends to play or talk with"
											isModel={true}
											isMainButton={false}
											buttonContent="coming soon..."
											imgSrc="images/bmo.png"
											/>
										</div>
										<div className="grid lg:grid-cols-[1fr_1.1fr] lg:gap-32 gap-16">
											<OnlineMatches />
											<OnlineMatches />
										</div>
										<div className="primary-glass"></div>
									</article>
									{friends.length !== 0 &&
										<>
											<div className="min-w-[83px] lg:flex hidden"></div>
											<article className="fixed side-online-friends-container py-16 primary-glass min-w-[83px] lg:flex hidden flex-col gap-16 items-center ">
												<div className="px-8 custom-scrollbar overflow-y-auto">
													{friends}
												</div>
											</article>
										</>
									}
							</section>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default Home;
