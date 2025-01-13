import Header from "../components/Header";
import Brackets from "../components/tournaments/Brackets";
import { useNavigate, useParams } from "react-router-dom";
import CreateTournament from "@/components/tournaments/CreateTournament";
import { useContext, useEffect, useState } from "react";
import Toast from "@/components/Toast";
import AuthContext from "@/context/AuthContext";

const Tournaments = () => {
  const authContextData = useContext(AuthContext);
  const { uid } = useParams();
  const navigate = useNavigate();
  const [displayCreateTournament, setDisplayCreateTournament] = useState(false);

  const tournaments = [];
  for (let i = 0; i < 100; i++) {
    tournaments.push(
      <div
        onClick={() => navigate(`/tournaments/${i}`)}
        key={i}
        className="w-full p-16 bg-gray/5 rounded-lg border border-gray/10 flex gap-16 justify-between items-center cursor-pointer"
      >
        <div className="flex flex-col gap-4">
          <h1 className="font-bold tracking-wider">tournament</h1>
          <p className="text-txt-sm tracking-wider">ping pong</p>
        </div>
        <div className="text-gray">november 12, 2025</div>
        <div className="flex flex-col gap-4 items-center">
          <h1 className="tracking-wider">1/4</h1>
          <p className="text-txt-sm tracking-wider font-bold">teams</p>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <h1 className="font-bold tracking-wider">registrations</h1>
          <p className="text-txt-sm tracking-wider text-green">open</p>
        </div>
      </div>,
    );
  }

  useEffect(() => {
    return () => {
      authContextData.setGlobalMessage({ message: "", isError: false });
    };
  }, []);

  return (
    <div className="flex flex-col grow lg:gap-32 gap-16">
      <Header link="tournaments" />

      {authContextData.globalMessage &&
        authContextData.globalMessage.message && <Toast position="topCenter" />}

      {displayCreateTournament && (
        <CreateTournament
          setDisplayCreateTournament={setDisplayCreateTournament}
        />
      )}

      <div className="container">
        <div
          className={`flex flex-col w-full ${uid ? "bmo-height" : "get-height"} bg-[url(/images/fakeGlass.png)]
						bg-cover rounded-lg border-[0.5px] border-stroke-pr overflow-hidden`}
        >
          <div
            className="w-full max-h-[200px] min-h-[200px] bg-[url('/images/pongCover.png')]
							bg-cover bg-center relative flex justify-end items-end p-16"
          >
            <div className="w-full h-full absolute cover-gradient top-0 bottom-0 left-0 right-0"></div>
            {!uid && (
              <button
                onClick={() => setDisplayCreateTournament(true)}
                className="z-10 secondary-glass p-8 px-16 transition-all flex gap-4
								justify-center items-center hover:bg-green/60
								hover:text-black rounded-md text-green font-semibold tracking-wide"
              >
                create a trounament
              </button>
            )}
          </div>
          <div className="tournaments-height">
            {uid ? (
              <Brackets />
            ) : (
              <div className="h-full w-full overflow-y-auto no-scrollbar p-16 flex flex-col gap-16">
                {tournaments}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
