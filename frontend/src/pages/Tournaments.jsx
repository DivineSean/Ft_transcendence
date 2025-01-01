import Header from "../components/Header";
import Brackets from "../components/Brackets";

const Tournaments = () => {
  return (
    <div className="flex flex-col grow">
      <Header link="tournaments" />
      <div className="container">
        <div className="flex flex-col gap-16 w-full overflow-hidden get-height bg-[url(/images/fakeGlass.png)] bg-cover rounded-lg overflow-hidden border-[0.5px] border-stroke-pr">
          <div className="top-0 left-0 w-full lg:h-[232px] h-[216px] bg-[url('/images/pongCover.png')] bg-cover bg-bottom relative">
            <div className="w-full h-full absolute cover-gradient "></div>
          </div>
          <div className="flex grow overflow-y-auto">
            <Brackets />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
