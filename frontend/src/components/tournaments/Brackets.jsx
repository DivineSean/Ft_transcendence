import { useEffect, useRef } from "react";
import Tournament from "../../utils/tournaments";
import { useParams } from "react-router-dom";
import FetchWrapper from "@/utils/fetchWrapper";

let region = null;

region = [
  {
    100: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "driss",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "hello",
        score: "",
      },
    ],
    200: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "khouna",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "hh",
        score: "",
      },
    ],
    300: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "ff",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "dd",
        score: "",
      },
    ],
    400: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "ss",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "aa",
        score: "",
      },
    ],
  },
  {
    500: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "driss",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "hh",
        score: "",
      },
    ],
    600: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "ff",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "aa",
        score: "",
      },
    ],
  },
  {
    700: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "hh",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        name: "ff",
        score: "",
      },
    ],
  },
];

// region = [
//   {
//     100: [
//       {
//         winnerClass: "team-winner",
//         loserClass: "",
//         teamClass: "team-driss",
//         name: "driss",
//         score: 67,
//       },
//       {
//         winnerClass: "",
//         loserClass: "team-loser",
//         teamClass: "team-hassan",
//         name: "hasan",
//         score: 55,
//       },
//     ],
//     200: [
//       {
//         winnerClass: "",
//         loserClass: "team-loser",
//         teamClass: "team-moha",
//         name: "moha",
//         score: 48,
//       },
//       {
//         winnerClass: "team-winner",
//         loserClass: "",
//         teamClass: "team-mas3oz",
//         name: "mas3oz",
//         score: 77,
//       },
//     ],
//     300: [
//       {
//         winnerClass: "team-winner",
//         loserClass: "",
//         teamClass: "team-jilali",
//         name: "jilali",
//         score: 76,
//       },
//       {
//         winnerClass: "",
//         loserClass: "team-loser",
//         teamClass: "team-lmgadar",
//         name: "lmgadar",
//         score: 59,
//       },
//     ],
//     400: [
//       {
//         winnerClass: "",
//         loserClass: "team-loser",
//         teamClass: "team-handala",
//         name: "handala",
//         score: 75,
//       },
//       {
//         winnerClass: "team-winner",
//         loserClass: "",
//         teamClass: "team-9ador",
//         name: "9ador",
//         score: 77,
//       },
//     ],
//   },
//   {
//     900: [
//       {
//         winnerClass: "team-winner",
//         loserClass: "",
//         teamClass: "team-driss",
//         name: "driss",
//         score: 61,
//       },
//       {
//         winnerClass: "",
//         loserClass: "team-loser",
//         teamClass: "team-mas3oz",
//         name: "mas3oz",
//         score: 45,
//       },
//     ],
//     1000: [
//       {
//         winnerClass: "team-winner",
//         loserClass: "",
//         teamClass: "team-jilali",
//         name: "jilali",
//         score: 77,
//       },
//       {
//         winnerClass: "",
//         loserClass: "team-loser",
//         teamClass: "team-9ador",
//         name: "9ador",
//         score: 60,
//       },
//     ],
//   },
//   {
//     1300: [
//       {
//         winnerClass: "team-winner",
//         loserClass: "",
//         teamClass: "team-driss",
//         name: "driss",
//         score: 79,
//       },
//       {
//         winnerClass: "",
//         loserClass: "team-loser",
//         teamClass: "team-jilali",
//         name: "jilali",
//         score: 68,
//       },
//     ],
//   },
// ];

const Brackets = () => {
  const canvasRef = useRef(null);
  const regionRef = useRef(null);
  const { uid } = useParams();
  const FetchData = new FetchWrapper();

  // const getBracket = async (uid) => {
  // 	try {
  // 		const res = await FetchData.get(`api/tournament/${uid}/`);
  // 		console.log(res);
  // 	} catch (error) {
  // 		console.log(error.message);
  // 	}
  // }

  // useEffect(() => {
  // 	getBracket(uid);
  // }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const tournament = new Tournament(canvasRef.current, regionRef.current);
      tournament.init();
    }
  }, [canvasRef, regionRef]);

  return (
    <>
      {region && (
        <div className="grow h-full region flex md:justify-center justify-start overflow-y-auto no-scrollbar gap-4">
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%" }}
            className="absolute top-0 left-0"
          ></canvas>

          {region.map((round, index) => (
            <section
              className={`flex flex-col justify-around h-full px-16 float-left w-1/3
						z-20 pointer-events-none
						round ${index >= 2 && "round-collapse"}`}
              key={index}
            >
              {Object.entries(round).map(([key, game]) => (
                <article
                  className="overflow-hidden flex 
									flex-col md:max-h-[300px] max-h-[70px] pointer-events-auto rounded-lg bg-center bg-black/30
									game relative"
                  key={key}
                >
                  <div className="absolute h-full w-full top-0 left-0 backdrop-blur-md rounded-lg border-[0.5px] border-stroke-pr"></div>
                  {game.map((team, index) => (
                    <div
                      className={`transition-all flex items-center justify-between cursor-pointer gap-8
											team z-10 md:p-8 p-4
											${team.winnerClass} ${team.loserClass} team-${team.name} 
											${index === 1 && "border-t-[0.5px] border-stroke-sc"}
										`}
                      data-team={team.name}
                      key={index}
                    >
                      <div className="flex gap-8 items-center md:max-w-full max-w-8">
                        <div className="max-w-32 min-w-32 min-h-32 max-h-32 rounded-full border-[0.5px] bg-gray/20 border-stroke-sc md:flex hidden overflow-hidden">
                          {team.name && (
                            <img
                              src="/images/default.jpeg"
                              alt="img"
                              className="object-cover grow"
                            />
                          )}
                        </div>
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis ">
                          {team.name ? team.name : "loading..."}
                        </span>
                      </div>
                      <span className="">{team.score ? team.score : "0"}</span>
                    </div>
                  ))}
                </article>
              ))}
            </section>
          ))}
        </div>
      )}
    </>
  );
};

export default Brackets;
