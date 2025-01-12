import { useEffect, useRef } from "react";
import Tournament from "../../utils/tournaments";

let region = null;

region = [
  {
    100: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
        score: "",
      },
    ],
    200: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
        score: "",
      },
    ],
    300: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
        score: "",
      },
    ],
    400: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
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
        seed: "",
        name: "",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
        score: "",
      },
    ],
    600: [
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
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
        seed: "",
        name: "",
        score: "",
      },
      {
        winnerClass: "",
        loserClass: "",
        teamClass: "",
        seed: "",
        name: "",
        score: "",
      },
    ],
  },
];

region = [
  {
    100: [
      {
        winnerClass: "team-winner",
        loserClass: "",
        teamClass: "team-driss",
        seed: 1,
        name: "driss",
        score: 67,
      },
      {
        winnerClass: "",
        loserClass: "team-loser",
        teamClass: "team-hassan",
        seed: 16,
        name: "hasan",
        score: 55,
      },
    ],
    200: [
      {
        winnerClass: "",
        loserClass: "team-loser",
        teamClass: "team-moha",
        seed: 8,
        name: "moha",
        score: 48,
      },
      {
        winnerClass: "team-winner",
        loserClass: "",
        teamClass: "team-mas3oz",
        seed: 9,
        name: "mas3oz",
        score: 77,
      },
    ],
    300: [
      {
        winnerClass: "team-winner",
        loserClass: "",
        teamClass: "team-jilali",
        seed: 4,
        name: "jilali",
        score: 76,
      },
      {
        winnerClass: "",
        loserClass: "team-loser",
        teamClass: "team-lmgadar",
        seed: 13,
        name: "lmgadar",
        score: 59,
      },
    ],
    400: [
      {
        winnerClass: "",
        loserClass: "team-loser",
        teamClass: "team-handala",
        seed: 5,
        name: "handala",
        score: 75,
      },
      {
        winnerClass: "team-winner",
        loserClass: "",
        teamClass: "team-9ador",
        seed: 12,
        name: "9ador",
        score: 77,
      },
    ],
  },
  {
    900: [
      {
        winnerClass: "team-winner",
        loserClass: "",
        teamClass: "team-driss",
        seed: 1,
        name: "driss",
        score: 61,
      },
      {
        winnerClass: "",
        loserClass: "team-loser",
        teamClass: "team-mas3oz",
        seed: 9,
        name: "mas3oz",
        score: 45,
      },
    ],
    1000: [
      {
        winnerClass: "team-winner",
        loserClass: "",
        teamClass: "team-jilali",
        seed: 4,
        name: "jilali",
        score: 77,
      },
      {
        winnerClass: "",
        loserClass: "team-loser",
        teamClass: "team-9ador",
        seed: 12,
        name: "9ador",
        score: 60,
      },
    ],
  },
  {
    1300: [
      {
        winnerClass: "team-winner",
        loserClass: "",
        teamClass: "team-driss",
        seed: 1,
        name: "driss",
        score: 79,
      },
      {
        winnerClass: "",
        loserClass: "team-loser",
        teamClass: "team-jilali",
        seed: 4,
        name: "jilali",
        score: 68,
      },
    ],
  },
];

// region = [
// 	{
// 		100: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player1', seed: 1, name: 'player1', score: 85 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player2', seed: 16, name: 'player2', score: 74 },
// 		],
// 		200: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player3', seed: 8, name: 'player3', score: 65 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player4', seed: 9, name: 'player4', score: 78 },
// 		],
// 		300: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player5', seed: 4, name: 'player5', score: 81 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player6', seed: 13, name: 'player6', score: 72 },
// 		],
// 		400: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player7', seed: 5, name: 'player7', score: 69 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player8', seed: 12, name: 'player8', score: 83 },
// 		],
// 		500: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player9', seed: 2, name: 'player9', score: 80 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player10', seed: 15, name: 'player10', score: 66 },
// 		],
// 		600: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player11', seed: 7, name: 'player11', score: 77 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player12', seed: 10, name: 'player12', score: 85 },
// 		],
// 		700: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player13', seed: 3, name: 'player13', score: 79 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player14', seed: 14, name: 'player14', score: 68 },
// 		],
// 		800: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player15', seed: 6, name: 'player15', score: 71 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player16', seed: 11, name: 'player16', score: 84 },
// 		],
// 	},
// 	{
// 		// Round 2: 4 Games
// 		900: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player1', seed: 1, name: 'player1', score: 86 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player4', seed: 9, name: 'player4', score: 70 },
// 		],
// 		1000: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player5', seed: 4, name: 'player5', score: 90 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player8', seed: 12, name: 'player8', score: 75 },
// 		],
// 		1100: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player9', seed: 2, name: 'player9', score: 78 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player12', seed: 10, name: 'player12', score: 88 },
// 		],
// 		1200: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player13', seed: 3, name: 'player13', score: 85 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player16', seed: 11, name: 'player16', score: 82 },
// 		],
// 	},
// 	{
// 		1300: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player1', seed: 1, name: 'player1', score: 89 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player5', seed: 4, name: 'player5', score: 78 },
// 		],
// 		1400: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player12', seed: 10, name: 'player12', score: 81 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player13', seed: 3, name: 'player13', score: 90 },
// 		],
// 	},
// 	{
// 		// Final: 1 Game
// 		1500: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player1', seed: 1, name: 'player1', score: 92 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player13', seed: 3, name: 'player13', score: 85 },
// 		],
// 	},
// ];

// region = [
// 	{
// 		// Round 1: 16 Games
// 		100: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player1', seed: 1, name: 'player1', score: 85 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player2', seed: 32, name: 'player2', score: 70 },
// 		],
// 		200: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player3', seed: 16, name: 'player3', score: 65 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player4', seed: 17, name: 'player4', score: 78 },
// 		],
// 		300: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player5', seed: 8, name: 'player5', score: 81 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player6', seed: 25, name: 'player6', score: 72 },
// 		],
// 		400: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player7', seed: 9, name: 'player7', score: 69 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player8', seed: 24, name: 'player8', score: 83 },
// 		],
// 		500: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player9', seed: 4, name: 'player9', score: 90 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player10', seed: 29, name: 'player10', score: 66 },
// 		],
// 		600: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player11', seed: 13, name: 'player11', score: 77 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player12', seed: 20, name: 'player12', score: 85 },
// 		],
// 		700: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player13', seed: 5, name: 'player13', score: 79 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player14', seed: 28, name: 'player14', score: 68 },
// 		],
// 		800: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player15', seed: 12, name: 'player15', score: 71 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player16', seed: 21, name: 'player16', score: 84 },
// 		],
// 		900: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player17', seed: 2, name: 'player17', score: 87 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player18', seed: 31, name: 'player18', score: 70 },
// 		],
// 		1000: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player19', seed: 15, name: 'player19', score: 74 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player20', seed: 18, name: 'player20', score: 81 },
// 		],
// 		1100: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player21', seed: 7, name: 'player21', score: 86 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player22', seed: 26, name: 'player22', score: 73 },
// 		],
// 		1200: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player23', seed: 10, name: 'player23', score: 75 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player24', seed: 23, name: 'player24', score: 80 },
// 		],
// 		1300: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player25', seed: 3, name: 'player25', score: 88 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player26', seed: 30, name: 'player26', score: 67 },
// 		],
// 		1400: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player27', seed: 14, name: 'player27', score: 72 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player28', seed: 19, name: 'player28', score: 85 },
// 		],
// 		1500: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player29', seed: 6, name: 'player29', score: 83 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player30', seed: 27, name: 'player30', score: 69 },
// 		],
// 		1600: [
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player31', seed: 11, name: 'player31', score: 74 },
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player32', seed: 22, name: 'player32', score: 88 },
// 		],
// 	},
// 	{
// 		// Round 2: 8 Games
// 		100: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player1', seed: 1, name: 'player1', score: 89 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player4', seed: 17, name: 'player4', score: 77 },
// 		],
// 		200: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player5', seed: 8, name: 'player5', score: 82 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player8', seed: 24, name: 'player8', score: 78 },
// 		],
// 		300: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player9', seed: 4, name: 'player9', score: 85 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player12', seed: 20, name: 'player12', score: 81 },
// 		],
// 		400: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player13', seed: 5, name: 'player13', score: 87 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player16', seed: 21, name: 'player16', score: 84 },
// 		],
// 		500: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player17', seed: 2, name: 'player17', score: 90 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player20', seed: 18, name: 'player20', score: 76 },
// 		],
// 		600: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player21', seed: 7, name: 'player21', score: 88 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player24', seed: 23, name: 'player24', score: 79 },
// 		],
// 		700: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player25', seed: 3, name: 'player25', score: 92 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player28', seed: 19, name: 'player28', score: 81 },
// 		],
// 		800: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player29', seed: 6, name: 'player29', score: 86 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player32', seed: 22, name: 'player32', score: 78 },
// 		],
// 	},
// 	{
// 		// Round 3: 4 Games
// 		100: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player1', seed: 1, name: 'player1', score: 88 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player5', seed: 8, name: 'player5', score: 85 },
// 		],
// 		200: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player9', seed: 4, name: 'player9', score: 91 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player13', seed: 5, name: 'player13', score: 83 },
// 		],
// 		300: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player17', seed: 2, name: 'player17', score: 87 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player21', seed: 7, name: 'player21', score: 80 },
// 		],
// 		400: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player25', seed: 3, name: 'player25', score: 89 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player29', seed: 6, name: 'player29', score: 81 },
// 		],
// 	},
// 	{
// 		// Round 4: 2 Games
// 		100: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player1', seed: 1, name: 'player1', score: 90 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player9', seed: 4, name: 'player9', score: 85 },
// 		],
// 		200: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player17', seed: 2, name: 'player17', score: 88 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player25', seed: 3, name: 'player25', score: 84 },
// 		],
// 	},
// 	{
// 		// Final: 1 Game
// 		100: [
// 			{ winnerClass: 'team-winner', loserClass: '', teamClass: 'team-player1', seed: 1, name: 'player1', score: 92 },
// 			{ winnerClass: '', loserClass: 'team-loser', teamClass: 'team-player2', seed: 9, name: 'player2', score: 89 },
// 		],
// 	},
// ];

const Brackets = () => {
  const canvasRef = useRef(null);
  const regionRef = useRef(null);

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
