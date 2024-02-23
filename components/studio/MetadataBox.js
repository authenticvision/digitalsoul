import React, { useState } from 'react'
import Link from 'next/link'

const MetadataBox = ({ nft, readOnly = false }) => {
	const [metadata, setMetadata] = useState(nft.metadata || {})

	const metadataKeys = Object.keys(metadata)?.filter((key) => key != 'attributes')

	return (
		<div className="collapse bg-[#29303f] collapse-arrow border rounded-lg border-raven-700">
			<input type="checkbox" />
			<div className="collapse-title text-2xl font-bold">
				Metadata
			</div>

			<div className="collapse-content relative">
				<div className="flex flex-col">
					{metadataKeys.length > 0 && (
						<div className="grid grid-cols-3 grid-rows-1 gap-2">
							{metadataKeys.map((prop, index) => (
								<div key={prop} className="flex flex-col w-18 h-18 text-center rounded p-4">
									<span className="font-bold">{prop}</span>
									<span className="mt-2">{metadata[prop]}</span>
								</div>
							))}
						</div>
					)}

					{metadataKeys.length == 0 && (
						<div className="flex flex-col">
							<p className="w-full">
								This NFT has no additional metadata (attributes/traits below)
							</p>
						</div>
					)}

					{!readOnly && (
						<Link href={`/studio/${nft.contract.csn.toLowerCase()}/${nft.anchor}/edit`}
							className="btn btn-link text-white text-center">
							Edit Attributes and Metadata
						</Link>
					)}
				</div>
			</div>
		</div>
	)
}

export default MetadataBox
