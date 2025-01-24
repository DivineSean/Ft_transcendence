import { GrStatusGood } from "react-icons/gr";
import { useEffect, useState, useContext } from "react";
import { IoMdClose } from "react-icons/io";
import { VscError } from "react-icons/vsc";
import AuthContext from "../context/AuthContext";

const Toast = ({ duration = 3000, error = true, position = "topCenter" }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(true);
  const [progress, setProgress] = useState(0);
  const authContextData = useContext(AuthContext);

  useEffect(() => {
    if (authContextData.globalMessage.message) {
      setIsVisible(true);
      setOpacity(true);
      setProgress(0);
    }
  }, [authContextData.globalMessage.message]);

  const removeToast = () => {
    setIsVisible(false);
    authContextData.setGlobalMessage({ message: "", isError: true });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : 100));
    }, duration / 100);

    const timeout = setTimeout(() => {
      setOpacity(false);
    }, duration);

    const timeoutVisible = setTimeout(() => {
      setIsVisible(false);
      authContextData.setGlobalMessage({ message: "", isError: true });
    }, duration + 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      clearTimeout(timeoutVisible);
    };
  }, [duration, authContextData.setGlobalMessage]);

  return (
    isVisible &&
    authContextData.globalMessage.message && (
      <div
        className={`
			${position === "topCenter" && "top-32 left-1/2 transform -translate-x-1/2"}
			${position === "bottomCenter" && "bottom-32 left-1/2 transform -translate-x-1/2"}
			${position === "topRight" && "top-32 right-32"}
			${position === "topLeft" && "top-32 left-32"}
			${position === "bottomLeft" && "bottom-32 left-32"}
			${position === "bottomRight" && "bottom-32 right-32"}
			justify-between
			py-8 px-16 fixed z-[1000] overflow-hidden
			flex gap-8 items-center rounded-lg
			border-[0.5px] border-stroke-sc md:max-w-[400px] max-w-[90%] min-w-[10px] transition-opacity
			duration-800 ${opacity ? "opacity-100" : "opacity-0"}
		`}
      >
        <div className="bg-[url('/images/background.png')] bg-cover bg-center absolute right-0 bottom-0 top-0 left-0 z-[-1]"></div>
        <div className="backdrop-blur-md absolute right-0 bottom-0 top-0 left-0 z-[-1]"></div>

        {!authContextData.globalMessage.icon ? (
          <div
            className={`${authContextData.globalMessage.isError ? "bg-red" : "bg-green"} h-[2px] absolute bottom-0 left-0 z-[-1]`}
            style={{ width: `${progress}%` }}
          ></div>
        ) : (
          <div
            className={`bg-green h-[2px] absolute bottom-0 left-0 z-[-1]`}
            style={{ width: `${progress}%` }}
          ></div>
        )}
        {!authContextData.globalMessage.icon ? (
          <div className="flex gap-8 items-center">
            {authContextData.globalMessage.isError && (
              <div className="min-w-16 max-w-16 flex items-center">
                <VscError className="text-red text-txt-md" />
              </div>
            )}
            {!authContextData.globalMessage.isError && (
              <div className="min-w-16 max-w-16">
                <GrStatusGood className="text-green text-txt-md" />
              </div>
            )}
            <p className="tracking-wide text-txt-sm text-white normal-case flex gap-16 items-center">
              <span
                className={`font-bold tracking-wide ${authContextData.globalMessage.isError ? "text-red" : "text-green"}`}
              >
                {authContextData.globalMessage.isError
                  ? "error: "
                  : "success: "}
              </span>
              {authContextData.globalMessage.message}
            </p>
          </div>
        ) : (
          <div className="flex gap-8 items-center normal-case flex gap-16 items-center">
            <div className="min-w-16 max-w-16 flex items-center">
              {authContextData.globalMessage.icon}
            </div>
            <span className="font-bold tracking-wide text-white">
              {authContextData.globalMessage.username}
            </span>
            {authContextData.globalMessage.message.slice(0, 20)}
          </div>
        )}
        <IoMdClose
          onClick={removeToast}
          className="cursor-pointer text-txt-xl min-w-16"
        />
      </div>
    )
  );
};

export default Toast;
