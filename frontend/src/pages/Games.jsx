import OnlineGame from "../games/OnlineGame";
import Header from "../components/Header";
import React, { useState, useEffect } from "react";
import { ImArrowUp } from "react-icons/im";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

const CrossButtons = () => {
  return (
    <div className="grid grid-cols-3 grid-rows-3 min-h-[75px] min-w-[75px] max-h-[164px] max-w-[164px] w-[20vmin] h-[20vmin]">
      <button className="bg-[#FFD42A] rounded-t-md md:rounded-t-lg text-white row-start-1 col-start-2"></button>

      <button className="bg-[#FFD42A] rounded-l-md md:rounded-l-lg text-white row-start-2 col-start-1"></button>

      <div
        className="bg-[#FFD42A] row-start-2 col-start-2"
        aria-hidden="true"
      ></div>

      <button className="bg-[#FFD42A] rounded-r-md md:rounded-r-lg text-white row-start-2 col-start-3"></button>

      <button className="bg-[#FFD42A] rounded-b-md md:rounded-b-lg text-white row-start-3 col-start-2"></button>
    </div>
  );
};

const GameCard = ({
  onClick,
  color = "#C83737",
  name = "Coming soon",
  image = "",
}) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-16 px-8 pb-8 w-[250px] h-[250px]"
      style={{ backgroundColor: color }}
    >
      <span className="flex justify-between">
        <ImArrowUp className="mt-4 text-gray" />
        <span className="flex flex-col w-1/2 bg-white rounded-b-md md:rounded-b-lg items-end px-16 py-4">
          <span
            className="h-full w-1/6"
            style={{ backgroundColor: color }}
          ></span>
        </span>
        <span></span>
      </span>
      <span
        className="grow bg-blue-600 nes-container with-title is-centered is-rounded bg-cover bg-center"
        style={{ backgroundImage: image, backgroundSize: "cover" }}
      >
        <h1 className="title text-xl text-center">{name}</h1>
      </span>
      <span className="w-full h-[15px] flex justify-between">
        <span className="bg-gray w-[15px]"></span>
        <span className="bg-gray w-[15px]"></span>
      </span>
    </div>
  );
};

const GamesLibrary = ({ games }) => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-wrap items-center justify-center gap-16 md:gap-32 p-16 md:p-32 overflow-y-auto custom-scrollbar">
      {games.map((game) => (
        <GameCard {...game} onClick={() => navigate(game.name)} key={game.id} />
      ))}
      <GameCard color="#222" />
      <GameCard color="#222" />
    </div>
  );
};

const GameModes = ({ games }) => {
  const navigate = useNavigate();
  const { game } = useParams();

  const gameObject = games.find((Game) => Game.name === game);
  return (
    <>
      {gameObject ? (
        <div className="flex flex-col md:flex-row h-full gap-16 p-16">
          {gameObject.modes &&
            Object.entries(gameObject.modes).map(([mode, enabled]) => (
              <button
                key={mode}
                onClick={() => enabled && navigate(mode)}
                className={`nes-btn grow ${enabled ? "" : "is-disabled"}`}
                disabled={!enabled}
              >
                {mode}
              </button>
            ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full p-8 md:p-64">
          <span className="nes-container is-rounded !m-0 !p-4 md:!p-16">
            <p className="text-xs md:text-lg">
              Oh no, adventurer! This game is not available. Please go back to
              the game library and choose another fun adventure!
            </p>
            <button
              className="nes-btn !text-xs md:!text-lg"
              onClick={() => navigate("/games")}
            >
              {"<"} Go Back
            </button>
          </span>
        </div>
      )}
    </>
  );
};

const ModeDetails = ({ games }) => {
  const navigate = useNavigate();
  const { game, mode } = useParams();

  useEffect(() => {
    const gameObject = games.find((Game) => Game.name === game);
    if (!gameObject) navigate("/games");
    else {
      const modeObject =
        gameObject.modes && mode in gameObject.modes
          ? gameObject.modes[mode]
          : undefined;
      if (!modeObject) navigate(`/games/${game}`);
    }
    if (mode === "local")
      navigate("PongLocal");
  }, [])

  const Modes = () => {
    switch (mode) {
      case "ai":
        return <div>ai</div>;
      case "online":
        return <OnlineGame game={game} />;
      case "local":
        return <div className="h-full flex flex-col justify-center items-center p-8">Waiting...</div>;
      default:
        return <div>no such mode</div>;
    }
  };

  return <>{Modes()}</>;
};

const BmoScreen = ({ games }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);

  const resetRoute = (index) => {
    const newRoutes = routes.slice(0, index + 1);
    setRoutes(newRoutes);
    console.log(newRoutes, newRoutes[index]);
    navigate(newRoutes.join("/"));
  };

  useEffect(() => {
    const path = location.pathname;
    let routes = path
      .split("/")
      .filter((element, _) => element !== "")
      .filter((element, index) => !(index === 0 && element === "games"))
      .map(decodeURIComponent);
    setRoutes(routes);
  }, [location]);

  return (
    <>
      <div className="bg-[#165044] w-full items-center flex gap-16">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 48 48"
          className="max-w-[50px] max-h-[30px] md:max-h-[40px]"
        >
          <path
            fill="none"
            stroke="#00796b"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="3"
            d="M3.5 34.5C3.5 29.253 7.753 24 13 24M44.5 14.5c0 5.247-4.253 9.5-9.5 9.5M19.5 36.5L19.5 44.5M28.5 36.5L28.5 44.5"
          ></path>
          <path
            fill="#00bfa5"
            d="M34,37H14c-1.105,0-2-0.895-2-2V5c0-1.105,0.895-2,2-2h20c1.105,0,2,0.895,2,2v30 C36,36.105,35.105,37,34,37z"
          ></path>
          <path
            fill="#e0f2f1"
            d="M32,19H16c-0.552,0-1-0.448-1-1V7c0-0.552,0.448-1,1-1h16c0.552,0,1,0.448,1,1v11 C33,18.552,32.552,19,32,19z"
          ></path>
          <path
            fill="#212121"
            d="M18.5 9A1.5 1.5 0 1 0 18.5 12 1.5 1.5 0 1 0 18.5 9zM29.5 9A1.5 1.5 0 1 0 29.5 12 1.5 1.5 0 1 0 29.5 9z"
          ></path>
          <path
            fill="none"
            stroke="#212121"
            strokeMiterlimit="10"
            d="M26.5,13c0,1.381-1.119,2.5-2.5,2.5s-2.5-1.119-2.5-2.5"
          ></path>
          <path
            fill="#212121"
            d="M15 21H27V23H15zM32 21A1 1 0 1 0 32 23 1 1 0 1 0 32 21z"
          ></path>
          <path
            fill="#76ff03"
            d="M33 26A1 1 0 1 0 33 28A1 1 0 1 0 33 26Z"
          ></path>
          <path fill="#ffea00" d="M17 25H19V31H17z"></path>
          <path
            fill="#ffea00"
            d="M17 25H19V31H17z"
            transform="rotate(-90 18 28)"
          ></path>
          <path
            fill="#212121"
            d="M18 35h-2c-.552 0-1-.448-1-1l0 0c0-.552.448-1 1-1h2c.552 0 1 .448 1 1l0 0C19 34.552 18.552 35 18 35zM24 35h-2c-.552 0-1-.448-1-1l0 0c0-.552.448-1 1-1h2c.552 0 1 .448 1 1l0 0C25 34.552 24.552 35 24 35z"
          ></path>
          <path
            fill="#ff3d00"
            d="M30.5 30A2.5 2.5 0 1 0 30.5 35A2.5 2.5 0 1 0 30.5 30Z"
          ></path>
          <path fill="#84ffff" d="M28 25L26 28 30 28z"></path>
        </svg>
        <button
          onClick={() => resetRoute("Games")}
          className="font-press-start text-txt-xs md:text-txt-md"
        >
          Games
        </button>
        {routes.map((route, index) => (
          <React.Fragment key={index}>
            {index < routes.length && (
              <h2 className="font-press-start text-txt-xs md:text-txt-md">
                {" "}
                {">"}{" "}
              </h2>
            )}
            <button
              onClick={() => resetRoute(index)}
              className="font-press-start text-txt-xs md:text-txt-md"
            >
              {route}
            </button>
          </React.Fragment>
        ))}
      </div>
      <div className="bg-[#B2F5CE] min-h-[200px] grow nes-wrapper">
        <Routes>
          <Route path="/" element={<GamesLibrary games={games} />} />
          <Route path="/:game" element={<GameModes games={games} />} />
          <Route path="/:game/:mode" element={<ModeDetails games={games} />} />
        </Routes>
      </div>
    </>
  );
};

const Games = () => {
  const games = [
    {
      id: 0,
      name: "pong",
      image:
        "url('https://mir-s3-cdn-cf.behance.net/project_modules/fs/05daa256209423.59a540cb340e6.jpg')",
      modes: {
        ai: true,
        online: true,
        local: true,
      },
    },
    {
      id: 1,
      name: "fleabag vs mutt",
      image: "url('https://www.gimori.com/images/cat-vs-dog.jpg')",
      modes: {
        ai: true,
        online: true,
        local: true,
      },
    },
  ];

  return (
    <div className="flex flex-col grow">
      <Header link="games" />
      <div className="backdrop-blur-sm w-full h-full absolute top-0 right-0"></div>
      <div className="container md:px-16 px-0">
        <div className="primary-glass p-16 md:p-32 min-h-[570px] h-full bmo-height">
          <div className="bg-[#2CA086] bmo-frame rounded-lg min-h-[520px] w-full h-full flex lg:flex-row flex-col gap-16 p-16 md:p-32 overflow-y-auto no-scrollbar">
            <div className="max-w-[20%] hidden lg:pt-16 lg:flex flex-col justify-between items-center">
              <button className="bg-[#006680] rounded-lg min-w-[32px] min-h-[8px] max-w-[64px] max-h-[22px] w-[7vmin] h-[2.5vmin]"></button>
              <CrossButtons />
              <span></span>
            </div>
            <div className="grow min-h-fit h-[70%] lg:h-full flex flex-col gap-64 lg:gap-16">
              <div className="bmo-screen rounded-xl relative overflow-hidden grow flex flex-col">
                <BmoScreen games={games} />
              </div>
              <div className="flex justify-between items-center min-h-[23px] max-h-[47px]">
                <span className="bg-[#165044] rounded-md md:rounded-lg h-full w-[60%]"></span>
                <button className="bg-[#006680] rounded-full min-h-[23px] min-w-[23px] max-h-[47px] max-w-[47px] w-[6vmin] h-[6vmin]"></button>
              </div>
            </div>
            <div className="grow p-16 md:p-32 md:pb-0 lg:p-0 justify-between lg:max-w-[20%] flex">
              <div className="lg:hidden gap-16 md:gap-32 flex flex-col justify-center items-center">
                <CrossButtons />
                <span className="flex justify-around gap-16">
                  <button className="bg-[#006680] rounded-lg min-w-[32px] min-h-[8px] max-w-[64px] max-h-[22px] w-[7vmin] h-[2.5vmin]"></button>
                  <button className="bg-[#006680] rounded-lg min-w-[32px] min-h-[8px] max-w-[64px] max-h-[22px] w-[7vmin] h-[2.5vmin]"></button>
                </span>
              </div>
              <div className="grow flex lg:flex-col lg:justify-between lg:pt-16 justify-end items-center gap-32">
                <button className="hidden lg:block bg-[#006680] rounded-lg min-w-[32px] min-h-[8px] max-w-[64px] max-h-[22px] w-[7vmin] h-[2.5vmin]"></button>
                <span className="flex flex-col gap-8">
                  <span className="flex gap-16 items-end">
                    <button className="mb-[2.5%] border-b-[clamp(10px,7.5vmin,60px)] border-[#5FBCD3] border-r-[clamp(5px,5.2vmin,40px)] border-r-transparent border-l-[clamp(5px,5.2vmin,40px)] border-l-transparent"></button>
                    <button className="bg-[#71C837] rounded-full min-w-[24px] min-h-[24px] max-w-[50px] max-h-[50px] w-[6.5vmin] h-[6.5vmin]"></button>
                  </span>
                  <span className="flex justify-center">
                    <button className="bg-[#C83737] rounded-full min-w-[50px] min-h-[50px] max-h-[115px] max-w-[115px] w-[13.5vmin] h-[13.5vmin]"></button>
                  </span>
                </span>
                <span className="hidden lg:block"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
