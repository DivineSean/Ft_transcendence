import SideOnlineFriends from "../components/home/SideOnlineFriends";
import OnlineMatches from "../components/home/OnlineMatches";
import UpcomingTournament from "../components/home/UpcomingTournament";
import AuthContext from "../context/AuthContext";
import Card from "../components/home/Card";
import Header from "../components/Header";
import { useContext, useEffect } from "react";
import UserContext from "../context/UserContext";
import LoadingPage from "./LoadingPage";
import Toast from "../components/Toast";

const Home = () => {
  const authContextData = useContext(AuthContext);
  const userContextData = useContext(UserContext);

  const friends = [];
  useEffect(() => {
    userContextData.getFriends();
    userContextData.getOnlineMatches();
    userContextData.getUpcomingTournament();

    return () =>
      authContextData.setGlobalMessage({ message: "", isError: false });
  }, []);

  // useEffect(() => { }, [userContextData.onlineMatches]);

  // console.log("here: ", userContextData);
  if (
    userContextData &&
    userContextData.userFriends &&
    userContextData.userFriends.friends
  ) {
    userContextData.userFriends.friends.map((friend) => {
      friends.push(<SideOnlineFriends key={friend.id} friend={friend} />);
    });
  }
  return (
    <div className="flex flex-col grow lg:gap-32 gap-16">
      <Header link="home" />
      {authContextData.globalMessage &&
        authContextData.globalMessage.message && <Toast position="topCenter" />}
      {(userContextData.generalLoading || !userContextData.onlineMatches) && (
        <LoadingPage />
      )}
      {!userContextData.generalLoading && (
        <>
          {!authContextData.displayMenuGl && (
            <div className="container px-16 pb-16">
              <section className="flex lg:gap-32 gap-16 justify-end">
                <div className="backdrop-blur-sm w-full h-full absolute top-0 right-0 z-[-1]"></div>
                <article className="flex flex-col gap-32">
                  <div className="grid lg:grid-cols-[1.1fr_1fr] lg:gap-32 gap-16">
                    <Card
                      title="welcome back,"
                      name={
                        userContextData.userInfo &&
                        userContextData.userInfo.first_name
                      }
                      description={`
												Welcome, Adventurer! Prepare for exciting challenges, fierce competition, and new connections with players from around the world
											`}
                      isModel={false}
                      isMainButton={true}
                      buttonContent="Play Now"
                      imgSrc="images/bmoModel.png"
                      link="/games"
                    />
                    <Card
                      title="Undiscovered"
                      name="World"
                      description="Adventure awaits! Meet friends, play games, and explore a world full of possibilities."
                      isModel={false}
                      isMainButton={false}
                      buttonContent="Coming Soon"
                      imgSrc="images/earth.png"
                    />
                  </div>
                  <div className="grid lg:grid-cols-[1fr_1.1fr] lg:gap-32 gap-16">
                    {userContextData.onlineMatches && (
                      <>
                        <OnlineMatches name={"online"} />
                        <OnlineMatches name={"tournament"} />
                      </>
                    )}
                  </div>
                  <div className="">
                    {userContextData.upcomingTournament && (
											<UpcomingTournament />
										)}
                  </div>
                </article>
                {friends.length !== 0 && (
                  <>
                    <div className="min-w-[83px] lg:flex hidden"></div>
                    <article className="fixed side-online-friends-container py-16 primary-glass min-w-[83px] lg:flex hidden flex-col gap-16 items-center">
                      <div className="px-8 custom-scrollbar overflow-y-auto">
                        {friends}
                      </div>
                    </article>
                  </>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
