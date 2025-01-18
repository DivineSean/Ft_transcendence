import { useEffect, useRef, useState } from "react";
import Tournament from "../../utils/tournaments";
import { useParams } from "react-router-dom";
import FetchWrapper, { BACKENDURL } from "@/utils/fetchWrapper";

const defaultBracket = [
  {
    100: [
      {
        username: "",
        score: "",
      },
      {
        username: "",
        score: "",
      },
    ],
    200: [
      {
        username: "",
        score: "",
      },
      {
        username: "",
        score: "",
      },
    ]
  },
  {
    500: [
      {
        username: "",
        score: "",
      },
      {
        username: "",
        score: "",
      },
    ],
  }
];

const Brackets = ({ setDisplayError }) => {
  const canvasRef = useRef(null);
  const { uid } = useParams();
  const FetchData = new FetchWrapper();
	const [bracket, setBracket] = useState(null);
	const [region, setRegion] = useState(null);

	const getBracket = async () => {
		try {
			const res = await FetchData.get(`api/tournament/${uid}/`);
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				setBracket(data);
				setRegion(data.region);
				console.log(data);
			} else if (res.status === 400) {
				const data = await res.json();
				console.log(data.error);
			}
		} catch (error) {
			console.log(error.message);
		}
	}

	useEffect(() => {
		getBracket();
	}, []);

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const tournament = new Tournament(canvasRef.current);
      tournament.init();
    }
  }, [canvasRef && canvasRef.current]);

	useEffect(() => {
		if (bracket && bracket.maxPlayers !== bracket.currentPlayerCount) {
			setRegion(defaultBracket);
			setDisplayError(true);
		}
	})

  return (
    <>
			{/* {region && bracket.maxPlayers !== bracket.currentPlayerCount && 
				<div className="grow flex justify-center items-center text-stroke-sc p-8 tracking-wider text-xs font-semibold text-center">
					the first round does not complete yet that's why you cannot see the bracket right now. this is just the example.
				</div>
			} */}
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
											${(bracket.isCompleted && team.result === 'win') ? 'team-winner' : ''}
											${(bracket.isCompleted && team.result === 'loss') ? 'team-loser' : ''}
											team-${team.username} 
											${index === 1 && "border-t-[0.5px] border-stroke-sc"}
										`}
                      data-team={team.username}
                      key={index}
                    >

                      <div className="flex gap-8 items-center md:max-w-full max-w-8">

                        <div className="max-w-32 min-w-32 min-h-32 max-h-32 rounded-full border-[0.5px] bg-gray/20 border-stroke-sc md:flex hidden overflow-hidden">
                         
												  {team.username && (
                            <img
                              src={
																team.profile_image
																	? `${BACKENDURL}${team.profile_image}`
																	: "/images/default.jpeg"
															}
                              alt="img"
                              className="object-cover grow"
                            />
                          )}

                        </div>

                        <span className="whitespace-nowrap overflow-hidden text-ellipsis ">
                          {team.username ? team.username : "loading..."}
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
