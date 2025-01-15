import React, { useContext, useEffect, useState } from "react";
import Header from "../components/Header";
import UserContext from "../context/UserContext";
import AuthContext from "../context/AuthContext";
import LoadingPage from "./LoadingPage";
import RankedUsers from "@/components/rankings/RankedUsers";
import TopThreePlayers from "@/components/rankings/TopThreePlayers";
import { useNavigate } from "react-router-dom";

const Rankings = () => {
  const navigate = useNavigate();
  const { rankings, get_rankings } = useContext(UserContext);
  const [ next_offset, setNextOffset ] = useState(0);
  const authContextData = useContext(AuthContext);
  const [selectedGame, setSelectedGame] = useState("pong");

  useEffect(() => {
    get_rankings(selectedGame, next_offset);
    return () =>
      authContextData.setGlobalMessage({ message: "", isError: false });
  }, [selectedGame]);

  if (!rankings || !rankings.rankings) {
    return (
      <>
        <div className="flex flex-col grow lg:gap-32 gap-16">
          <Header link="rankings" />
          <LoadingPage />
        </div>
      </>
    );
  }
  // setNextOffset(authContextData.rankings.rankings.next_offset);
  const currentUserRank = rankings.rankings.find((player) => player.is_self);
  const otherPlayers = rankings.rankings.filter(
    (player) => !rankings.rankings.slice(0, 3).includes(player),
  );

  return (
    <>
      {rankings && (
        <div className="flex flex-col grow lg:gap-32 gap-16">
          <Header link="rankings" />
          <div className="container md:px-16 px-0">
            <div className="primary-glass get-height flex flex-col md:p-32 p-16 gap-16 ">
              <div className="flex flex-col overflow-hidden grow">
                <TopThreePlayers players={rankings.rankings.slice(0, 3)} />

                <div className="bg-gray/5 relative flex flex-col md:p-16 p-8 gap-8 overflow-hidden rounded-md grow border-[0.5px] border-stroke-sc">
                  {currentUserRank && (
                    <div
                      onClick={() =>
                        navigate(
                          `/profile/overview/${currentUserRank.username}`,
                        )
                      }
                      className="grid lg:grid-cols-5 grid-cols-4 gap-32 bg-[#DAA520]/10 hover:bg-[#DAA520]/20 transition-all border border-[#DAA520]/50 rounded-lg text-center p-8 z-10 mb-16 cursor-pointer"
                    >
                      <p>{currentUserRank.rank}</p>
                      <p className="font-bold">you</p>
                      <p className="hidden lg:block">{currentUserRank.exp}</p>
                      <p className="lg:block hidden">
                        {currentUserRank.demote}/{currentUserRank.rating}/
                        {currentUserRank.promote}
                      </p>
                      <p className="lg:hidden block">
                        {currentUserRank.rating}
                      </p>
                      <p>{currentUserRank.ranked}</p>
                    </div>
                  )}

                  <div className="grid lg:grid-cols-5 grid-cols-4 gap-32 text-center font-bold z-10 bg-black/30 rounded-lg py-8">
                    <p>Rank</p>
                    <p>Player</p>
                    <p className="hidden lg:block">Account Level</p>
                    <p className="lg:block hidden">
                      <span title="Demote">D/</span>
                      <span title="MMR">M/</span>
                      <span title="Promote">P</span>
                    </p>
                    <p className="lg:hidden block">
                      <span>MMR</span>
                    </p>
                    <p>Elo</p>
                  </div>

                  <div className="flex flex-col gap-8 lg:overflow-y-scroll no-scrollbar z-10">
                    {otherPlayers.map((player) => (
                      <RankedUsers
                        key={player.user_id}
                        rank={player.rank}
                        username={player.username}
                        demote={player.demote}
                        rating={player.rating}
                        promote={player.promote}
                        lvl={player.exp}
                        ranked={player.ranked}
                        isSelf={player.is_self}
                      />
                    ))}
                    {otherPlayers.length === 0 && (
                      <div className="flex justify-center text-stroke-sc">
                        no players yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Rankings;
