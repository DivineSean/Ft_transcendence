import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

const GameToast = ({
  title,
  message,
  duration = 100000,
  onClose
}) => {
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
      <div className={`
        transform transition-all duration-300 ease-out
        ${showContent ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
      `}>
        {/* Main Container */}
        <div className="bg-gray-900/95 backdrop-blur rounded-lg shadow-2xl 
                      border border-white/10 overflow-hidden w-full md:w-80">
          {/* Top Accent Line */}
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          
          <div className="p-4">
            {/* Icon & Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse">
                {/* <Trophy className="w-5 h-5 text-white" /> */}
                <img 
                  src={`/images/achievement/icons/${title}.png`}
                  alt="achievemet icon"
                  className="w-56 h-56"
                />
              </div>
              
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                achievement triggered
                </p>
                <h3 className="text-white font-bold mt-0.5">
                  {title}
                </h3>
              </div>
            </div>
            
            {/* Message */}
            <p className="text-gray-300 text-sm mt-2">
              {message}
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-1 bg-gray-800">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r 
                         from-blue-500 to-purple-500 transition-all duration-200"
              style={{
                width: showContent ? '100%' : '0%',
                transitionDuration: `${duration}ms`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameToast;