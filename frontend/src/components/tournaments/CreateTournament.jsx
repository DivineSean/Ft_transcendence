import { useState } from "react";
import InputUpdateProfile from "../profile/InputUpdateProfile";
import { RxCross2 } from "react-icons/rx";

const CreateTournament = ({ setDisplayCreateTournament }) => {
  const [formData, setFormData] = useState({
    tournament_name: "",
    games: "pong",
    players: 4,
  });

  const handleChange = (e) => {
    let { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="absolute top-0 left-0 h-full w-full z-[100] flex justify-center items-center">
      <div
        onClick={() => setDisplayCreateTournament(false)}
        className="bg-black/80 top-0 left-0 h-full cursor-pointer w-full flex justify-center items-center"
      ></div>
      <div
        className="fixed w-[90%] gap-32 md:w-[600px] overflow-y-auto no-scrollbar
						max-h-[90%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col secondary-glass
						p-16 rounded-md"
      >
        <div className="flex justify-between">
          <h1 className="text-center font-bold tracking-wider text-h-sm-md">
            create new tournament
          </h1>
          <RxCross2
            onClick={() => setDisplayCreateTournament(false)}
            className="text-2xl cursor-pointer"
          />
        </div>

        <form className="flex flex-col gap-32" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-32">
            <InputUpdateProfile
              formData={formData.tournament_name}
              onChange={handleChange}
              title="tournament name"
              type="text"
              value={formData.tournament_name}
              name="tournament_name"
            />
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex gap-16 items-center">
              <div className="h-[0.5px] bg-stroke-sc grow rounded-full"></div>
              <p>games</p>
              <div className="h-[0.5px] bg-stroke-sc grow rounded-full"></div>
            </div>

            <div className="flex gap-8">
              <div className="flex gap-8 grow relative">
                <input
                  value={formData.games}
                  defaultChecked
                  type="radio"
                  name="games"
                  className="peer absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />

                <label
                  htmlFor="games"
                  className="peer-checked:text-black peer-checked:bg-green/60 border border-stroke-sc p-8 rounded-lg
										peer-hover:bg-green/60 transition-all grow text-center peer-hover:text-black"
                >
                  ping pong
                </label>
              </div>

              <div className="flex gap-8 grow relative">
                <input
                  value={formData.games}
                  type="radio"
                  disabled
                  name="games"
                  className="peer absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="games"
                  className="peer-checked:text-black peer-checked:bg-green/60 border border-stroke-sc p-8 rounded-lg
										peer-hover:bg-green/60 transition-all grow text-center peer-hover:text-black
										peer-disabled:bg-transparent peer-disabled:text-stroke-sc"
                >
                  coming soon...
                </label>
              </div>

              <div className="flex gap-8 grow relative">
                <input
                  value={formData.games}
                  type="radio"
                  disabled
                  name="games"
                  className="peer absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="games"
                  className="peer-checked:text-black peer-checked:bg-green/60 border border-stroke-sc p-8 rounded-lg
										peer-hover:bg-green/60 transition-all grow text-center peer-hover:text-black
										peer-disabled:bg-transparent peer-disabled:text-stroke-sc"
                >
                  coming soon...
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex gap-16 items-center">
              <div className="h-[0.5px] bg-stroke-sc grow rounded-full"></div>
              <p>players</p>
              <div className="h-[0.5px] bg-stroke-sc grow rounded-full"></div>
            </div>

            <div className="flex gap-8">
              <div className="flex gap-8 grow relative">
                <input
                  onChange={handleChange}
                  value={4}
                  defaultChecked
                  type="radio"
                  name="players"
                  className="peer absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />

                <label
                  htmlFor="players"
                  className="peer-checked:text-black peer-checked:bg-green/60 border border-stroke-sc p-8 rounded-lg
										peer-hover:bg-green/60 transition-all grow text-center peer-hover:text-black"
                >
                  4
                </label>
              </div>

              <div className="flex gap-8 grow relative">
                <input
                  onChange={handleChange}
                  value={8}
                  type="radio"
                  name="players"
                  className="peer absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
                <label
                  htmlFor="players"
                  className="peer-checked:text-black peer-checked:bg-green/60 border border-stroke-sc p-8 rounded-lg
										peer-hover:bg-green/60 transition-all grow text-center peer-hover:text-black"
                >
                  8
                </label>
              </div>

              <div className="flex gap-8 grow relative">
                <input
                  onChange={handleChange}
                  value={16}
                  type="radio"
                  name="players"
                  className="peer absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
                <label
                  htmlFor="players"
                  className="peer-checked:text-black peer-checked:bg-green/60 border border-stroke-sc p-8 rounded-lg
										peer-hover:bg-green/60 transition-all grow text-center peer-hover:text-black"
                >
                  16
                </label>
              </div>
            </div>
          </div>

          <button className="bg-green p-8 text-black text-lg font-bold rounded-sm disabled:bg-green/20">
            create
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTournament;
