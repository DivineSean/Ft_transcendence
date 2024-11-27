import { PiEyeClosedBold, PiEyeBold } from "react-icons/pi";
import { useState } from "react";

const InputFieled = ({ ...props }) => {
  const isPassword = props.type === "password";
  const [display, setDisplay] = useState(false);
  return (
    <>
      {!isPassword && (
        <input
          name={props.name}
          type={props.type}
          placeholder={props.placeholder}
          onChange={props.onChange}
          onBlur={props.onBlur}
          className={`py-16 login-input border-b-2 grow ${props.error ? "border-red" : "border-stroke-sc"}`}
        />
      )}
      {isPassword && (
        <div
          className={`py-16 login-input flex gap-16 border-b-2 grow ${props.error ? "border-red" : "border-stroke-sc"}`}
        >
          <input
            name={props.name}
            type={display ? "text" : "password"}
            placeholder={props.placeholder}
            onChange={props.onChange}
            onBlur={props.onBlur}
            className="bg-transparent outline-none grow"
          />
          {!display && (
            <PiEyeClosedBold
              className="text-gray text-txt-xl cursor-pointer"
              onClick={() => setDisplay(true)}
            />
          )}
          {display && (
            <PiEyeBold
              className="text-gray text-txt-xl cursor-pointer"
              onClick={() => setDisplay(false)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default InputFieled;
