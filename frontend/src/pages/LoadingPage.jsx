import "../styles/loadingBmo.css";

const LoadingPage = () => {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <div className="h-full w-full flex justify-center items-center lg:scale-75 md:scale-50 scale-50">
        <div className="main flex justify-center items-center w-[300px] h-[400px]">
          <div
            className="
							relative w-[61%] h-[55%] rounded-[20px] bg-[#1c8852]
							before:content-[''] before:absolute before:h-full before:w-[80%]
							before:bg-green before:rounded-[20px]
						"
          >
            <div className="face flex justify-center items-center absolute top-[8%] left-[10%] w-[61%] h-[49%] rounded-[20px] bg-[#219b5e]">
              <div className="face__l"></div>
              <div className="w-[8%] h-[23%] bg-[#001d31] z-[1000]"></div>
              <div className="w-[23%] h-[8%] mx-[7%] bg-[#001d31] z-[1000]"></div>
              <div className="w-[8%] h-[23%] bg-[#001d31] z-[1000]"></div>
            </div>
            <div className="control">
              <div className="control__plus"></div>
              <div className="control__plus"></div>
              <div className="control__button"></div>
              <div className="control__button"></div>
            </div>
            <div className="line">
              <div className="ln line__1"></div>
              <div className="ln line__2"></div>
              <div className="ln line__3"></div>
              <div className="ln line__3"></div>
              <div className="ln line__3"></div>
            </div>
            <div className="head"></div>
            <div className="drop"></div>
            <div className="arm arm-l"></div>
            <div className="arm arm-r"></div>
            <div className="leg leg-l"></div>
            <div className="leg leg-r"></div>
          </div>
        </div>
        <div className="floor"> </div>
      </div>
    </div>
  );
};
export default LoadingPage;
