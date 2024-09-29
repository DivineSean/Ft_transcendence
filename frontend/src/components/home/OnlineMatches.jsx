const Matches = () => {
	return (
		<div className="flex gap-16 justify-between text-txt-sm">
			<p className="">Robert<span className="text-green uppercase font-bold"> vs </span>kristin</p>
			<p className="">Robert<span className="text-green uppercase font-bold"> vs </span>kristin</p>
			<p className="">Robert<span className="text-green uppercase font-bold"> vs </span>kristin</p>
			<p className="">Robert<span className="text-green uppercase font-bold"> vs </span>kristin</p>
		</div>
	)
}

const OnlineMatches = () => {
	const matches = [];
	for (let i = 0; i < 100; i++) {
		matches.push(
			<tr key={i}>
				<td>Robert<span className="text-green font-semibold lowercase"> vs </span>kristin</td>
				<td>02:01</td>
				<td>1<span className="px-4">-</span>2</td>
				<td className="text-right"><button className="py-4 px-12 bg-green rounded text-black font-semibold">watch</button></td>
			</tr>
		)
	}
	return (
		<div className="glass-component flex-col md:gap-32 gap-16">
				<h3 className="md:text-h-lg-md text-h-sm-md">Online Matches</h3>
				<div className="secondary-glass py-8 flex-col flex lg:max-h-[500px] max-h-[400px]">
					<div className="overflow-y-scroll px-16 flex flex-col custom-scrollbar">
						<table className="table-auto text-left border-separate border-spacing-y-8">
							<thead>
								<tr className="md:text-txt-md text-txt-sm border-b-[5px] border-stroke-sc">
									<th>competitors</th>
									<th>time</th>
									<th>result</th>
									<th className="text-right">live</th>
								</tr>
							</thead>
							<tbody className="text-txt-sm mx-h-[200px]">
								{matches}
							</tbody>
						</table>
					</div>
				</div>
		</div>
	)
}

export default OnlineMatches;