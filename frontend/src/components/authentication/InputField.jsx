import { PiEyeClosedBold, PiEyeBold } from "react-icons/pi";
import { useState, useContext } from "react";
import AuthContext from "../../context/AuthContext";

const InputFieled = ({ ...props }) => {
  const isPassword = props.type === "password";
  const [display, setDisplay] = useState(false);
  const authContextData = useContext(AuthContext);
  return (
    <>
      {!isPassword && (
        <div className="flex relative">
          <input
            name={props.name}
            type={props.type}
            defaultValue={props.value}
            onChange={props.onChange}
            onBlur={authContextData.handleBlur}
            className={`
				py-16  grow peer outline-none bg-transparent grow border 
				rounded-sm px-16 transition-all 
				${props.error ? "border-red" : "border-stroke-sc focus:border-gray"}
			`}
          />
          <label
            className={`
				absolute top-1/2 -translate-y-1/2
				${props.formData ? "top-[-12px] left-0 text-txt-lg" : "left-16 text-txt-md"}
				${props.error ? "text-red" : "text-white"}
				transition-all peer-focus:left-0 peer-focus:text-txt-md peer-focus:top-[-12px]
			`}
          >
            {props.title}
          </label>
        </div>
      )}

      {isPassword && (
        <div className={`relative flex items-center gap-16 grow`}>
          <input
            name={props.name}
            type={display ? "text" : "password"}
            onChange={props.onChange}
            onBlur={authContextData.handleBlur}
            className={`
				py-16  grow peer outline-none bg-transparent grow 
				px-16 transition-all border rounded-sm
				${props.error ? "border-red" : "border-stroke-sc focus:border-gray"}
			`}
          />
          {!display && (
            <PiEyeClosedBold
              className="text-stroke-sc text-txt-xl cursor-pointer absolute right-16"
              onClick={() => setDisplay(true)}
            />
          )}
          {display && (
            <PiEyeBold
              className="text-stroke-sc text-txt-xl cursor-pointer absolute right-16"
              onClick={() => setDisplay(false)}
            />
          )}
          <label
            className={`
					absolute top-1/2 -translate-y-1/2
					${props.formData ? "top-[-12px] left-0 text-txt-lg" : "left-16 text-txt-md"}
					${props.error ? "text-red" : "text-white"}
					transition-all peer-focus:left-0 peer-focus:text-txt-md peer-focus:top-[-12px]
				`}
          >
            {props.title}
          </label>
        </div>
      )}
    </>
  );
};

export default InputFieled;
