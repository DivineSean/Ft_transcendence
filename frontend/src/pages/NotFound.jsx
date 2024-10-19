import { Link, useNavigate } from "react-router-dom";


const NotFound = () => {
	const navigate = useNavigate();
	const goBack = () => {
		navigate(-1);
	}
	return (
		<div className="grow h-screen backdrop-blur-xl flex flex-col gap-16 items-center justify-center ralative pt-[100px]">
			<span className="md:text-[20rem] text-[10rem] flex gap-32">404</span>
			<div className="text-txt-md w-[50%] text-center font-light text-gray">
				Uh oh. we can't seem to find the page you're looking for. Try going back to the 
				<span onClick={goBack} className="text-green font-bold hover:underline cursor-pointer"> previous</span> or <Link className="text-green font-bold hover:underline" to="/home">home</Link> page
			</div>
		</div>
	)
}

export default NotFound;