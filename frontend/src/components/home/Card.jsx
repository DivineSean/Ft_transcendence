import WorldModel from "./WorldModel";
import { useNavigate } from "react-router-dom";
const Card = ({ ...props }) => {
  const navigate = useNavigate()
  return (
    <div className="glass-component justify-between lg:pr-8 md:h-[283px]">
      <div className="flex flex-col md:justify-between gap-16">
        <p className="text-white lg:text-h-lg-lg text-h-sm-xl leading-[1.3] md:max-w-[200px]">
          {props.title}
          <span className="text-green font-bold"> {props.name}!</span>
        </p>
        <p className="lg:text-txt-xs text-txt-lg md:max-w-[80%]">
          {props.description}
        </p>
        <div className="flex gap-4 md:gap-8 justify-start mt-6 md:mt-8">
          {props.isMainButton && (
            <button onClick={()=>navigate(props.link)} className="secondary-glass p-8 px-32 transition-all flex gap-4 justify-center items-center
               rounded-md font-semibold tracking-wide hover:bg-green/60 hover:text-black text-green">
              {props.buttonContent}
            </button>
          )}
          {!props.isMainButton && (
            <button
              disabled={true}
             className="secondary-glass p-8 px-32 transition-all flex gap-4 justify-center items-center disabled:cursor-not-allowed
               rounded-md font-semibold tracking-wide hover:bg-green/60 hover:text-black text-white disabled:bg-transparent disabled:text-stroke-sc">
              {props.buttonContent}
            </button>
          )}
        </div>
      </div>
      {!props.isModel && (
        <img
          src={props.imgSrc}
          alt="bmo"
          className="md:h-full h-[80%] md:inline hidden"
        />
      )}
      {props.isModel && <WorldModel />}
    </div>
  );
};

export default Card;
