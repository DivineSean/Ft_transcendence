import { GrStatusGood } from "react-icons/gr";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { VscError } from "react-icons/vsc";

const Toast = ({ duration = 3000, error = true, message, onClose, position='topCenter' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setOpacity(true);
      setProgress(0);
    }
  }, [message]);

  const removeToast = () => {
    setIsVisible(false);
    if (onClose) onClose({ message: "", isError: true });
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
      if (onClose) onClose({ message: "", isError: true });
    }, duration + 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      clearTimeout(timeoutVisible);
    };
  }, [duration, onClose]);

  return (
    isVisible &&
    message && (
      <div
        className={`
				${position === 'topCenter' && 'top-32 left-1/2 transform -translate-x-1/2'}
				${position === 'bottomCenter' && 'bottom-32 left-1/2 transform -translate-x-1/2'}
				${position === 'topRight' && 'top-32 right-32'}
				${position === 'topLeft' && 'top-32 left-32'}
				${position === 'bottomLeft' && 'bottom-32 left-32'}
				${position === 'bottomRight' && 'bottom-32 right-32'}
				justify-between
				py-8 px-16 fixed z-[10] overflow-hidden backdrop-blur-2xl
				flex gap-8 items-center rounded-lg
				border-[0.5px] border-stroke-sc max-w-[400px] min-w-[10px] transition-opacity
				duration-800 ${opacity ? "opacity-100" : "opacity-0"}
			`}
      >
        <div
          className={`${error ? "bg-red" : "bg-green"} h-full absolute top-0 left-0 opacity-20 z-[-1]`}
          style={{ width: `${progress}%` }}
        ></div>
        <div className="flex gap-8 items-center">
          {error && (
            <div className="min-w-16 max-w-16">
              <VscError className="text-red text-txt-md" />
            </div>
          )}
          {!error && (
            <div className="min-w-16 max-w-16">
              <GrStatusGood className="text-green text-txt-md" />
            </div>
          )}
          <p className="font-light tracking-wide text-txt-sm text-gray">
            <span className="font-bold tracking-wide text-white">
              {error ? "error: " : "success: "}
            </span>
            {message}
          </p>
        </div>
        <IoMdClose
          onClick={removeToast}
          className="cursor-pointer text-txt-xl min-w-16"
        />
      </div>
    )
  );
};

export default Toast;
