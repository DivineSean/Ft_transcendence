import {
  IoSearchOutline,
  IoNotificationsOutline,
  IoNotifications,
} from "react-icons/io5";
import Header from "../components/Header";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const RankedUsers = ({ rank, player, won, winRate, status }) => {
  return (
    <div className="grid grid-cols-5 gap-32 text-center">
      <p>{rank}</p>
      <p>{player}</p>
      <p>{won}</p>
      <p>{winRate}</p>
      <p>{status}</p>
    </div>
  );
};

const Rankings = () => {
  const { displayMenuGl } = useContext(AuthContext);
  const rankedUsers = [];
  for (let i = 1; i < 100; i++) {
    rankedUsers.push(
      <RankedUsers
        rank={i}
        player={"si mhammed"}
        won={i}
        winRate={Math.floor(Math.random() * 100)}
        status={"online"}
      />,
    );
  }
  return (
    <div className="flex flex-col grow lg:gap-32 gap-16">
      <Header link="rankings" />
      {!displayMenuGl && (
        <div className="container md:px-16 px-0">
          <div className="primary-glass grow flex flex-col md:p-32 p-16 gap-32 get-height">
            <div className="flex flex-col overflow-hidden">
              <div className="grid grid-cols-3 md:gap-32 gap-16 items-end justify-center lg:px-64 md:px-16 px-8">
                <div className="flex flex-col gap-16">
                  <div className="flex flex-col items-center gap-8">
                    <img
                      src="/images/profile.png"
                      className="md:w-[80px] md:h-[80px] w-[56px] h-[56px] rounded-full"
                    />
                    <h2 className="text-txt-xs">simohammed</h2>
                  </div>
                  <div className="h-[120px] bg-[url('/images/background.png')] bg-top bg-cover norepeat overflow-hidden relative flex justify-center items-center rounded-t-lg">
				  	<div className="absolute hover-secondary backdrop-blur-2xl w-full h-full"></div>
                    <p className="text-h-lg-2xl font-bold z-10">2</p>
                  </div>
                </div>
                <div className="flex flex-col gap-16">
                  <div className="flex flex-col items-center gap-8">
                    <img
                      src="/images/profile.png"
                      className="md:w-[96px] w-[64px] md:h-[96px] h-[64px] rounded-full"
                    />
                    <h2 className="md:text-txt-md text-txt-xs">simohammed</h2>
                  </div>
                  <div className="h-[160px] bg-[url('/images/background.png')] bg-top bg-cover norepeat overflow-hidden relative flex justify-center items-center rounded-t-lg">
				  	<div className="absolute hover-secondary backdrop-blur-2xl w-full h-full"></div>
                    <p className="text-h-lg-4xl text-green font-bold z-10">1</p>
                  </div>
                </div>
                <div className="flex flex-col gap-16">
                  <div className="flex flex-col items-center gap-8">
                    <img
                      src="/images/profile.png"
                      className="md:w-[80px] w-[56px] md:h-[80px] h-[56px] rounded-full"
                    />
                    <h2 className="text-txt-xs">simohammed</h2>
                  </div>
                  <div className="h-[80px] bg-[url('/images/background.png')] bg-center bg-cover norepeat overflow-hidden relative flex justify-center items-center rounded-t-lg">
				  	<div className="absolute hover-secondary backdrop-blur-2xl w-full h-full"></div>
                    <p className="text-h-lg-xl font-bold z-10">3</p>
                  </div>
                </div>
              </div>
              <div className="bg-[url('/images/background.png')] norepeat relative flex flex-col p-32 gap-16 overflow-hidden rounded-md bg-cover bg-center bg-fixed">
                <div className="absolute w-full h-full secondary-glass top-0 left-0"></div>
				<div className="grid grid-cols-5 gap-32 hover-secondary rounded-lg text-center py-8 z-10">
                  <p>22</p>
                  <p className="font-bold">you</p>
                  <p>426</p>
                  <p>20%</p>
                  <p className="text-green">Online</p>
                </div>
                <div className="flex flex-col gap-8 mt-16 z-10">
                  <div className="h-[0.5px] bg-stroke-sc"></div>
                  <div className="grid grid-cols-5 gap-32 text-center font-bold py-8">
                    <p>rank</p>
                    <p>player</p>
                    <p>won</p>
                    <p>win rate</p>
                    <p>status</p>
                  </div>
                  <div className="h-[0.5px] bg-stroke-sc"></div>
                </div>
                <div className="flex flex-col gap-16 overflow-y-scroll no-scrollbar z-10">
                  {rankedUsers}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rankings;
