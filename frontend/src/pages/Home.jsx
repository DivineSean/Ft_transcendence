import SideOnlineFriends from "../components/home/SideOnlineFriends";
import OnlineMatches from "../components/home/OnlineMatches";
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

    return () =>
      authContextData.setGlobalMessage({ message: "", isError: false });
  }, []);

  useEffect(() => {}, [userContextData.onlineMatches]);

  if (userContextData.userFriends && userContextData.userFriends.friends) {
    userContextData.userFriends.friends.map((friend) => {
      friends.push(<SideOnlineFriends key={friend.id} friend={friend} />);
    });
  }
  console.log("im parents :", userContextData.onlineMatches);
  return (
    <div className="flex flex-col grow lg:gap-32 gap-16">
      <Header link="home" />
      {authContextData.globalMessage &&
        authContextData.globalMessage.message && <Toast position="topCenter" />}
      {(userContextData.generalLoading || !userContextData.onlineMatches) && <LoadingPage />}
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
												Welcome Adventurer! Get ready to have fun, compete, and connect with awesome players. Lets make this an unforgettable experience!
											`}
                      isModel={false}
                      isMainButton={true}
                      buttonContent="play now"
                      imgSrc="images/bmo.png"
                    />
                    <Card
                      title="Explore a New"
                      name="World"
                      description="Adventure awaits! Meet friends, play games, and explore a world full of possibilities."
                      isModel={true}
                      isMainButton={false}
                      buttonContent="coming soon..."
                      imgSrc="images/bmo.png"
                    />
                  </div>
                  <div className="grid lg:grid-cols-[1fr_1.1fr] lg:gap-32 gap-16">
                    {userContextData.onlineMatches && 
                      <>
                        <OnlineMatches name={"online"}/>
                        <OnlineMatches name={"tournament"}/>
                      </>
                    }
                  </div>
                  <div className="primary-glass"></div>
                </article>
                {friends.length !== 0 && (
                  <>
                    <div className="min-w-[83px] lg:flex hidden"></div>
                    <article className="fixed side-online-friends-container py-16 primary-glass min-w-[83px] lg:flex hidden flex-col gap-16 items-center ">
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
