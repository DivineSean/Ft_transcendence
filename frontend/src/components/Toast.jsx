import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

const Toast = ({
	duration = 5000,
	error = true,
	message,
	onClose
}) => {
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
		if (onClose) onClose({message: '', isError: true});
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
			if (onClose) onClose({message: '', isError: true});
    }, duration + 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      clearTimeout(timeoutVisible);
    };
  }, [duration, onClose]);

	return (
		isVisible && message &&
		<div 
			className={`
				left-1/2 transform -translate-x-1/2
				py-8 px-16 fixed z-[10000] overflow-hidden backdrop-blur-2xl
				flex gap-8 items-center lg:right-32 top-32 rounded-lg 
				border-[0.5px] border-stroke-sc max-w-[300px] transition-opacity
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