import Header from "../components/Header";
import Brackets from "../components/tournaments/Brackets";
import { useNavigate, useParams } from "react-router-dom";
import CreateTournament from "@/components/tournaments/CreateTournament";
import { useContext, useEffect, useState, useRef } from "react";
import Toast from "@/components/Toast";
import AuthContext from "@/context/AuthContext";
import ListTournaments from "@/components/tournaments/ListTournaments";

const Tournaments = () => {
  const authContextData = useContext(AuthContext);
  const { uid } = useParams();
  const [displayCreateTournament, setDisplayCreateTournament] = useState(false);
  const [tournaments, setTournaments] = useState(null);
  const [displayError, setDisplayError] = useState(false);

  useEffect(() => {
    return () => {
      authContextData.setGlobalMessage({ message: "", isError: false });
    };
  }, []);

  if (displayError) {
    console.log("s;ldkfjljkdfgljkfglkjfgl");
  }

  return (
    <div className="flex flex-col grow lg:gap-32 gap-16">
      <Header link="tournaments" />

      {authContextData.globalMessage &&
        authContextData.globalMessage.message && <Toast position="topCenter" />}

      {displayCreateTournament && (
        <CreateTournament
          setDisplayCreateTournament={setDisplayCreateTournament}
          setTournaments={setTournaments}
        />
      )}

      <div className="container">
        <div
          className={`flex flex-col w-full ${uid ? "bmo-height" : "bmo-height"} bg-[url(/images/fakeGlass.png)]
						bg-cover rounded-lg border-[0.5px] border-stroke-pr overflow-hidden`}
        >
          <div
            className="w-full lg:max-h-[200px] lg:min-h-[200px] min-h-[150px] max-h-[150px] bg-[url('/images/pongCover.png')]
							bg-cover bg-center relative flex justify-end items-end p-16"
          >
            <div className="w-full h-full absolute cover-gradient top-0 bottom-0 left-0 right-0"></div>
            {!uid && (
              <button
                onClick={() => setDisplayCreateTournament(true)}
                className="z-10 secondary-glass p-8 px-16 transition-all flex gap-4
								justify-center items-center hover:bg-green/60 lg:text-txt-md text-txt-sm
								hover:text-black rounded-md text-green font-semibold tracking-wide"
              >
                Create New Tournament
              </button>
            )}
            {displayError && (
              <div className="absolute left-1/2 -translate-x-1/2 text-xs w-full px-16 bottom-4 text-center text-white md:text-red md:text-txt-sm">
                the first round does not complete yet that's why you cannot see
                the bracket right now. this is just the example.
              </div>
            )}
          </div>
          <div className="tournaments-height">
            {uid ? (
              <Brackets setDisplayError={setDisplayError} />
            ) : (
              <ListTournaments
                tournaments={tournaments}
                setTournaments={setTournaments}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
