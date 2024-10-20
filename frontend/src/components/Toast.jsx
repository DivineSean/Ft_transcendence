import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

const Toast = ({
	duration = 5000,
	error = true,
	message
}) => {
	const [isVisible, setIsVisible] = useState(message ? true : false);
	const [opacity, setOpacity] = useState(true);
	const [progress, setProgress] = useState(0);

	console.log('is visible', isVisible);

	const removeToast = () => {
		setIsVisible(false);
	}

	useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : 100));
    }, duration / 100);

    const timeout = setTimeout(() => {
      setOpacity(false);
    }, duration);

    const timeoutVisible = setTimeout(() => {
      setIsVisible(false);
    }, duration + 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      clearTimeout(timeoutVisible);
    };
  }, [duration, isVisible]);

	return (
		isVisible &&
		<div 
			className={`
				py-8 px-16 fixed z-[10000] overflow-hidden backdrop-blur-2xl
				flex gap-8 items-center lg:right-32 right-16 top-32 rounded-lg 
				border-[0.5px] border-stroke-sc max-w-[340px] transition-opacity
				duration-800 ${opacity ? 'opacity-100' : 'opacity-0'}
			`}
		>
			<div
				className={`${error ? 'bg-red' : 'bg-green'} h-full w-[10%] absolute top-0 left-0 opacity-40 z-[-1]`}
				style={{ width: `${progress}%` }}
			></div>
			<p className="font-light tracking-wide w-full text-txt-sm">{message}</p>
			<IoMdClose onClick={removeToast} className="cursor-pointer text-txt-xl" />
		</div>
	)
}

export default Toast;

// import React, { useEffect, useState } from "react";

// const Toast = ({ message, duration = 5000, onClose }) => {
//   const [progress, setProgress] = useState(0);

  // useEffect(() => {
  //   // Increment the progress over time
  //   const interval = setInterval(() => {
  //     setProgress((prev) => (prev < 100 ? prev + 1 : 100));
  //   }, duration / 100); // Divide total duration by 100 to fill in that time

  //   // Automatically close the toast after the duration
  //   const timeout = setTimeout(() => {
  //     onClose();
  //   }, duration);

  //   return () => {
  //     clearInterval(interval);
  //     clearTimeout(timeout);
  //   };
  // }, [duration, onClose]);

//   return (
//     <div style={styles.toastContainer}>
//       <div style={{ ...styles.toast, backgroundSize: `${progress}% 100%` }}>
//         {message}
//       </div>
//     </div>
//   );
// };

// const styles = {
//   toastContainer: {
//     position: "fixed",
//     bottom: "20px",
//     right: "20px",
//     zIndex: 1000,
//   },
//   toast: {
//     padding: "10px 20px",
//     backgroundColor: "#333",
//     color: "#fff",
//     borderRadius: "5px",
//     boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//     backgroundImage: "linear-gradient(to right, #4caf50, #4caf50)",
//     backgroundRepeat: "no-repeat",
//     backgroundSize: "0% 100%", // Progress will animate this
//     transition: "background-size 0.1s linear", // Smooth transition for progress
//     overflow: "hidden",
//   },
// };

// export default Toast;