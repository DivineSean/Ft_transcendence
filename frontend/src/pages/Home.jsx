import SideOnlineFriends from "../components/home/SideOnlineFriends";
import OnlineMatches from "../components/home/OnlineMatches";
import AuthContext from "../context/AuthContext";
import Card from "../components/home/Card";
import Header from "../components/Header";
import { useContext } from "react";
import UserContext from "../context/UserContext";
import LoadingPage from "./LoadingPage";

const Home = () => {
  const authContextData = useContext(AuthContext);
  const userContextData = useContext(UserContext);
  const friends = [];
  for (let i = 0; i < 105; i++) {
    if (i === 0)
      friends.push(
        <SideOnlineFriends
          key={i}
          isOnline={true}
          isSend={true}
          messageNumber={4}
        />,
      );
    else if (i === 1)
      friends.push(
        <SideOnlineFriends
          key={i}
          isOnline={false}
          isSend={true}
          messageNumber={10}
        />,
      );
    else
      friends.push(
        <SideOnlineFriends key={i} isOnline={true} isSend={false} />,
      );
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
                      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
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
                      buttonContent="explore"
                      imgSrc="images/bmo.png"
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
          )}
        </>
      )}
    </div>
  );
};

export default Home;
