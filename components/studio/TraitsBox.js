const TraitsBox = ({ nft, ...props }) => {
	const traits = nft.metadata?.attributes
	const hasTraits = Array.isArray(traits) && traits.length > 0

	return (
		<div className="collapse bg-[#29303f] collapse-arrow border rounded-lg border-raven-700">
			<input type="checkbox" />
			<div className="collapse-title text-2xl font-bold">
				Traits
			</div>

			<div className="collapse-content">
				{hasTraits && (
					<div className="grid grid-cols-3 grid-rows-3 gap-2 pb-4">
						{nft.metadata.attributes.map((prop, index) => (
							Object.keys(prop).map((item, itemIndex) => (
								<div key={item} className="flex flex-col w-18 h-18 bg-base-300 text-center rounded p-4">
									<span>{item}</span>
									<span className="mt-2">{prop[item]}</span>
								</div>
							))
						))}
					</div>
				)}

				{!hasTraits && (
					<p className="w-full">This NFT has no traits</p>
				)}
			</div>
		</div>
	)
}

export default TraitsBox
