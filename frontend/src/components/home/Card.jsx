import WorldModel from "./WorldModel";

const Card = ({...props}) => {
	return (
		<div className="glass-component justify-between lg:pr-8 md:h-[283px]">
			<div className="flex flex-col md:justify-between gap-16">
				<p className="text-white lg:text-h-lg-lg text-h-sm-xl leading-[1.3] md:max-w-[200px]">
					{props.title}
					<span className="text-green font-bold"> {props.name}!</span>
				</p>
				<p className="lg:text-txt-xs text-txt-lg md:max-w-[80%]">
					{props.description}
				</p>
				<div className="flex items-end">
					{props.isMainButton && <button className="px-32 py-8 bg-green text-black font-semibold text-h-lg-md rounded">{props.buttonContent}</button>}
					{!props.isMainButton && <button className="px-32 py-8 text-white font-semibold text-h-lg-md rounded border-2 border-white">{props.buttonContent}</button>}
				</div>
			</div>
			{!props.isModel && <img src={props.imgSrc} alt="bmo" className="md:h-full h-[80%] md:inline hidden"/>}
			{props.isModel && <WorldModel />}
		</div>
	)
}

export default Card;