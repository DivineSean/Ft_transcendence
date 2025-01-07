import { useEffect, useState } from "react";

const GameToast = ({ duration = 3000, title, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setProgress(0);
    }
  }, [message]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : 100));
    }, duration / 100);
    const timeout = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose({ message: "", title: "" });
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onClose]);

  return (
    isVisible &&
    message && (
      <fieldset
        className={`
          fixed md:top-[100px] top-32 left-1/2 transform -translate-x-1/2
          flex flex-col z-10 md:p-16 p-8 px-16 rounded-md shadow-2xl
          border-[0.5px] border-green
        `}
      >
        {/* Bot Image in Legend */}
        <legend className="md:px-8 text-left flex gap-4 items-center">
          <img
            src="/images/bot.png"
            alt="Bot"
            className="w-[40px] h-[40px] md:block hidden"
          />
          <p className="text-white text-md font-bold text-center tracking-wide">
            {title}
          </p>
        </legend>

        <div className="flex flex-col gap-16">
          {/* Toast Message */}
          <p className="text-gray text-lg normal-case text-center tracking-wide md:text-txt-md text-txt-xs">
            {message}
          </p>

          {/* Progress Bar */}
          <div className="w-full md:h-4 h-2 bg-gray-700 rounded-full overflow-hidden bg-black/70">
            <div
              className="h-full bg-green transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </fieldset>
    )
  );
};

export default GameToast;
