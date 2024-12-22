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
      setProgress((prev) => Math.min(prev + (100 / (duration / 100)), 100));
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
          fixed top-1/3 left-1/2 transform -translate-x-1/2
          p-6 flex flex-col gap-4
          rounded-3xl shadow-2xl border-4 border-pink-500
          bg-gradient-to-br from-green-300 to-blue-500
          z-50 opacity-100
          animate-pulse
          
        `}
      >
        {/* Bot Image in Legend */}
        <legend className="px-2 text-left">
          <img
            src="/images/bot.png"
            alt="Bot"
            className="animate-wiggle"
            style={{ width: '40px', height: '40px' }}
          />
          <p className="text-white text-mg font-bold text-center tracking-widest" >{title}</p>
        </legend>

        {/* Toast Message */}
        <p className="text-white text-lg font-bold text-center tracking-widest">
          {message}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-500 transition-all"
            style={{
              width: `${progress}%`,
              transitionDuration: `${duration}ms`,
            }}
          ></div>
        </div>
      </fieldset>
    )
  );
};

export default GameToast;
