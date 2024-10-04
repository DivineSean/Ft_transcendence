
const InputFieled = ({...props}) => {
	return (
		<input
			name={props.name}
			type={props.type}
			placeholder={props.placeholder}
			onChange={props.onChange}
			onBlur={props.onBlur}
			className={`py-16 login-input border-b-2 grow ${props.error ? 'border-red' : 'border-stroke-sc'}`}
		/>
	)
}

export default InputFieled;