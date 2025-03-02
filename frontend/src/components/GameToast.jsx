import React, { useEffect, useState } from "react";

const GameToast = ({ title, message, duration = 100000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setTimeout(() => setShowContent(true), 100);

      const timer = setTimeout(() => {
        setShowContent(false);
        setTimeout(() => setIsVisible(false), 300);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!isVisible || !message) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 md:px-0 md:w-auto">
      <div
        className={`
        transform transition-all duration-300 ease-out
        ${showContent ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
      `}
      >
        {/* Main Container */}
        <div
          className="primary-glass rounded-lg shadow-2xl 
                    overflow-hidden w-full w-auto md:w-80"
        >
          {/* Top Accent Line */}
          <div className="h-1 bg-green" />

          <div className="p-4">
            {/* Icon & Title */}
            <div className="flex items-center gap-3">
              <div className="flex p-2 bg-black/50 rounded-full animate-pulse">
                <img
                  src={`/images/achievement/icons/${title}.png`}
                  alt="achievemet icon"
                  className="w-48 h-48 pointer-events-none"
                />
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide px-8">
                  achievement triggered
                </p>
                <h3 className="text-white font-bold mt-0.5">{title}</h3>
              </div>
            </div>

            {/* Message */}
            <p className="text-gray-300 text-sm mt-2">{message}</p>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1 bg-gray-800">
            <div
              className="absolute left-0 top-0 h-full bg-green transition-all duration-200"
              style={{
                width: showContent ? "100%" : "0%",
                transitionDuration: `${duration}ms`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameToast;
