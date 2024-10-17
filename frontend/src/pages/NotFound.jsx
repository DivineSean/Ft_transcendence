import { useEffect, useRef, useState } from "react";
import { bmo3DModel } from "../utils/bmo3DModel";
import { Link, useNavigate } from "react-router-dom";


const NotFound = () => {
	const navigate = useNavigate();
	const [isGrabbing, setIsGrabbing] = useState(false);
	const handleMouseDown = () => { setIsGrabbing(true); }
	const handleMouseUp = () => { setIsGrabbing(false); }
	const handleMouseLeave = () => { setIsGrabbing(false); }
	const goBack = () => {
		navigate(-1);
	}
	const canvasRef = useRef(null);
	useEffect(() => {
		if (canvasRef.current) {
			bmo3DModel(canvasRef.current, '/bmo/');
		}
	}, []);
	return (
		<div className="grow h-screen backdrop-blur-xl flex flex-col gap-16 items-center justify-center ralative pt-[100px]">
			<div className="text-txt-6xl flex gap-32">404</div>
			<div className="text-txt-md w-[50%] text-center font-light text-gray">
				Uh oh. we can't seem to find the page you're looking for. Try going back to the 
				<span onClick={goBack} className="text-green font-bold hover:underline cursor-pointer"> previous</span> or <Link className="text-green font-bold hover:underline" to="/home">home</Link> page
			</div>
			{/* <div className="flex gap-16 items-end">
				<button className="text-txt-md text-green font-bold hover:underline" onClick={goBack} >go back</button>
				<p>or</p>
				<Link className="text-txt-md text-green font-bold hover:underline" to="/home" >go home</Link>
			</div> */}
			<canvas
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				ref={canvasRef}
				className={`saturate-150 h-screen w-screen ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
			></canvas>
		</div>
	)
}

export default NotFound;