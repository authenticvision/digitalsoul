const TraitsBox = ({ nft, ...props }) => {
	const traits = nft.metadata?.attributes
	const hasTraits = Array.isArray(traits) && traits.length > 0

	return (
		<div className="collapse bg-[#29303f] collapse-arrow border rounded-lg border-raven-700">
			<input type="checkbox" />
			<div className="collapse-title text-2xl font-bold">
				Attributes (Traits)
			</div>

			<div className="collapse-content collapse-open">
				{hasTraits && (
					<div className="grid grid-cols-3 grid-rows-3 gap-2 pb-4">
						{nft.metadata.attributes.map((prop, index) => (
							<div key={index} className="flex flex-col w-18 h-18 text-center rounded p-4">
								<span className="font-bold">{prop['trait_type']}</span>
								<span className="mt-2">{prop['value']}</span>
							</div>
						))}
					</div>
				)}

				{!hasTraits && (
					<p className="w-full">This NFT has no traits.<br />Use Metadata-Edit above</p>
				)}
			</div>
		</div>
	)
}

export default TraitsBox
