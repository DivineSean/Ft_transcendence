import { IoGameController } from "react-icons/io5";
import { GiPingPongBat } from "react-icons/gi";
import { BACKENDURL } from "../../utils/fetchWrapper";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import UserContext from "@/context/UserContext";
import AuthContext from "@/context/AuthContext";
import FetchWrapper from "../../utils/fetchWrapper";

const FetchData = new FetchWrapper();

const UpcomingTournament = () => {
  const userContextData = useContext(UserContext);
  const authContextData = useContext(AuthContext);
  const tournament = userContextData.upcomingTournament;

  const joinTournament = async (tournamentId) => {
    try {
      const res = await FetchData.put("api/tournaments/", {
        id: tournamentId,
      });
      if (res.ok) {
        const data = await res.json();
        authContextData.setGlobalMessage({
          message: data.message,
          isError: false,
        });
      } else if (res.status === 400) {
        const data = await res.json();
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  // console.log(tournament, Object.keys(tournament).length === 0);
  return (
    <div className="glass-component flex-col md:gap-32 gap-16 ">
      <h3 className="md:text-h-lg-md text-h-sm-md">Upcoming tournament</h3>
      {/* <div className="flex gap-32 p-16 bg-gray/5 rounded-lg border border-gray/10 items-center"> */}
      <div className="bg-gray/5 rounded-lg py-8 border-[0.5px] border-stroke-sc flex-col flex lg:max-h-[100px] lg:h-[100px] max-h-[100px] h-[100px]">
        {Object.keys(tournament).length !== 0 ? (
          <div className="w-full flex gap-16 justify-between items-center cursor-pointer">
            <div className="flex flex-col gap-4">
              <h1 className="font-bold tracking-wider">
                {tournament.tournamentTitle}
              </h1>
              <p className="text-txt-sm tracking-wider">
                {tournament.gameData.name}
              </p>
            </div>
            <div className="text-gray md:block hidden">
              {tournament.created_at}
            </div>
            <div className="flex flex-col gap-4 items-center">
              <h1 className="tracking-wider">
                {tournament.currentPlayerCount}/{tournament.maxPlayers}
              </h1>
              <p className="text-txt-sm tracking-wider font-bold">players</p>
            </div>
            <div className="flex flex-col gap-4 items-center">
              {!tournament.isCreator ? (
                <button
                  onClick={() => joinTournament(tournament.id)}
                  className="secondary-glass p-8 px-32 transition-all flex gap-4 justify-center items-center
						rounded-md font-semibold tracking-wide hover:bg-green/60 hover:text-black text-green"
                >
                  Register
                </button>
              ) : (
                <button
                  disabled={true}
                  className="secondary-glass p-8 px-32 transition-all flex gap-4 justify-center items-center disabled:cursor-not-allowed
						rounded-md font-semibold tracking-wide hover:bg-green/60 hover:text-black text-white disabled:bg-transparent disabled:text-stroke-sc"
                >
                  Register
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-stroke-sc">
            No upcoming tournaments
          </p>
        )}
      </div>
    </div>
  );
};

export default UpcomingTournament;
