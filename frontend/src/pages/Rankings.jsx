import React, { useContext, useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import UserContext from "../context/UserContext";
import AuthContext from "../context/AuthContext";
import LoadingPage from "./LoadingPage";
import RankedUsers from "@/components/rankings/RankedUsers";
import TopThreePlayers from "@/components/rankings/TopThreePlayers";
import { useNavigate } from "react-router-dom";

const Rankings = () => {
  const navigate = useNavigate();
  const { get_rankings } = useContext(UserContext);
  const [rankings, setRankings] = useState(null);
  const [next_offset, setNextOffset] = useState(0);
  const [allPlayers, setAllPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const authContextData = useContext(AuthContext);
  const [selectedGame, setSelectedGame] = useState("pong");
  const scrollRef = useRef(null);
  const [chunkedData, setChunkedData] = useState(0);

  useEffect(() => {
    setAllPlayers([]);
    get_rankings(selectedGame, setRankings, next_offset);
    return () => (
      authContextData.setGlobalMessage({ message: "", isError: false }),
      window.removeEventListener("scroll", scrollHandler)
    );
  }, []);

  const scrollHandler = () => {
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
      const isNearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 5;
      if (isNearBottom && !isLoading && hasMore && !chunkedData) {
        setIsLoading(true);
        setChunkedData((prev) => prev + 1);
      }
    });
  };

  window.addEventListener("scroll", scrollHandler);

  useEffect(() => {
    if (rankings?.rankings) {
      setAllPlayers((prev) => {
        const newPlayers = rankings.rankings.filter(
          (newPlayer) =>
            !prev.some(
              (existingPlayer) => existingPlayer.user_id === newPlayer.user_id,
            ),
        );
        return [...prev, ...newPlayers];
      });

      if (rankings.next_offset === -1) {
        setHasMore(false);
      } else {
        setNextOffset(rankings.next_offset);
      }
      setIsLoading(false);
      setChunkedData(0);
    }
  }, [rankings]);

  useEffect(() => {
    const getChunkedData = setTimeout(() => {
      if (chunkedData !== 0 && next_offset !== 0) {
        get_rankings(selectedGame, setRankings, next_offset);
        setChunkedData(0);
      }
    }, 500);

    return () => clearTimeout(getChunkedData);
  }, [chunkedData, next_offset]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isNearBottom && !isLoading && hasMore && !chunkedData) {
        setIsLoading(true);
        setChunkedData((prev) => prev + 1);
      }
    }
  };

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

  const currentUserRank = allPlayers.find((player) => player.is_self);
  const otherPlayers = allPlayers.filter(
    (player) => !allPlayers.slice(0, 3).includes(player),
  );
  return (
    <>
      {rankings && (
        <div className="flex flex-col grow lg:gap-32 gap-16">
          <Header link="rankings" />
          <div className="container md:px-16 px-0">
            <div className="primary-glass get-height flex flex-col md:p-32 p-16 gap-16">
              <div className="flex flex-col overflow-hidden grow">
                <TopThreePlayers players={allPlayers.slice(0, 3)} />
                <div className="bg-gray/5 relative flex flex-col md:p-16 p-8 gap-8 overflow-hidden rounded-md grow border-[0.5px] border-stroke-sc">
                  {currentUserRank && (
                    <div
                      onClick={() =>
                        navigate(
                          `/profile/overview/${currentUserRank.username}`,
                        )
                      }
                      className="grid lg:grid-cols-5 grid-cols-4 gap-32 bg-[#DAA520]/10 hover:bg-[#DAA520]/20 transition-all border border-[#DAA520]/50 rounded-lg text-center p-8 z-10 mb-16 cursor-pointer items-center"
                    >
                      <p>{currentUserRank.rank}</p>
                      <p className="font-bold">you</p>
                      <p className="hidden lg:block">{currentUserRank.exp}</p>
                      <p>{currentUserRank.rating}</p>
                      <div className="flex justify-center">
                        <img
                          src={`/images/rating/${currentUserRank.ranked}.png`}
                          className="w-24 md:w-32 pointer-events-none"
                          alt="Rating level"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid lg:grid-cols-5 grid-cols-4 gap-32 text-center font-bold z-10 bg-black/30 rounded-lg py-8">
                    <p>Rank</p>
                    <p>Player</p>
                    <p className="hidden lg:block">Account Level</p>
                    <p className="lg:block hidden">
                      <span>Rating</span>
                    </p>
                    <p className="lg:hidden block">
                      <span>Rating</span>
                    </p>
                    <p>Elo</p>
                  </div>

                  <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex flex-col gap-8 lg:overflow-y-scroll no-scrollbar z-10"
                  >
                    {otherPlayers.map((player) => (
                      <RankedUsers
                        key={player.user_id}
                        rank={player.rank}
                        username={player.username}
                        rating={player.rating}
                        lvl={player.exp}
                        ranked={player.ranked}
                        isSelf={player.is_self}
                      />
                    ))}
                    {otherPlayers.length === 0 && (
                      <div className="flex justify-center text-stroke-sc">
                        the ranking system in this area will activate once there
                        are enough players
                      </div>
                    )}
                    <div
                      className={`text-center mb-16 text-xs text-green ${isLoading && hasMore ? "block" : "hidden"}`}
                    >
                      loading...
                    </div>
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
