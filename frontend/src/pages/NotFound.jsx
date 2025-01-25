import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen bg-[url(/images/notFound.png)] flex flex-col items-center bg-no-repeat justify-center text-center bg-cover bg-center">
      <div className="absolute inset-0 cover-gradient"></div>
      <div
        className="absolute inset-0 bg-[url(/images/notFound.png)]
					flex flex-col items-center bg-no-repeat justify-center
					text-center bg-cover bg-center bg-clip-text lg:text-[400px] md:text-[200px] text-[150px] text-transparent"
      >
        <span className="not-found">404</span>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 justify-end grow md:py-64 p-32">
        <p className="md:text-txt-md text-txt-xs xl:text-txt-xl max-w-[90%] md:max-w-[40%] tracking-wider bg-gray/15 border border-stroke-sc backdrop-blur-md p-8 rounded-lg">
          Whoa there, Adventurer! You seem to be lost in the Land of Ooo... .
          Try going back to the
          <span
            onClick={() => navigate(-1)}
            className="text-red font-bold hover:underline cursor-pointer"
          >
            {" "}
            previous
          </span>{" "}
          or head back to the{" "}
          <Link className="text-red font-bold hover:underline" to="/home">
            home
          </Link>{" "}
          page before the Ice King kidnaps you!
        </p>
      </div>
    </div>
  );
};

export default NotFound;
