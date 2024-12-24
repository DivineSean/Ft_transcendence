import Header from "../components/Header";

const Tournaments = () => {
  const firstBrackets = [];
  for (let i = 0; i < 1; i++) {
    firstBrackets.push(
      <div>
        <div className="flex items-center">
          <div className="flex flex-col bracket-shadow">
            <div className="flex rounded-t-sm overflow-hidden w-[200px] bg-[url('/images/background.png')] bg-cover bg-bottom relative">
              <div className="bg-green w-[4px] z-10"></div>
              <div className="flex py-8 px-16 z-10 justify-between grow text-txt-lg text-gray">
                <p>simohammed</p>
                <p>4</p>
              </div>
              <div className="absolute backdrop-blur-md w-full h-full"></div>
            </div>
            <div className="h-[1px] bg-gray"></div>
            <div className="flex rounded-b-sm overflow-hidden w-[200px] bg-[url('/images/background.png')] bg-cover bg-bottom relative">
              <div className="bg-red w-[4px] z-10"></div>
              <div className="flex py-8 px-16 z-10 justify-between grow text-txt-lg text-gray">
                <p>simohammed</p>
                <p>4</p>
              </div>
              <div className="absolute backdrop-blur-md w-full h-full "></div>
            </div>
          </div>
          <div className="h-[2px] w-16 border-t border-gray"></div>
        </div>
      </div>,
    );
  }
  return (
    <div className="flex flex-col grow">
      <div className="backdrop-blur-sm w-full h-full absolute top-0 right-0"></div>
      <Header link="profile" />
      <div className="container">
        <div className="flex flex-col primary-glass p-16relative overflow-hidden get-height">
          <div className="absolute top-0 left-0 w-full lg:h-[232px] h-[216px] bg-[url('/images/pongCover.png')] bg-cover bg-bottom">
            <div className="w-full h-full absolute cover-gradient "></div>
          </div>
          <div className="lg:h-[232px] h-[216px]"></div>
          <div className="flex p-16">
            <div className="flex flex-col gap-32">{firstBrackets}</div>
            <div className="flex flex-col gap-32">{firstBrackets}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
