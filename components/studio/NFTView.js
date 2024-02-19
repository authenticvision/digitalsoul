import React, { useState } from 'react'
import Link from 'next/link'
import { Alert } from '@/components/ui'
import { AdditionalAssetsBox, TraitsBox, MetadataBox, NFTImageEdit, NFTCaption } from '@/components/studio'

// TODO: Split this component into two, a standalone header & the body
const NFTView = ({ nft, wallet, contract, onFinishEditing, ...props }) => {
	const [error, setError] = useState()
	// There is a special anchor called 'default'.. In this case, it's a collection's default NFT
	// and does not have an actual SLID or actual anchor.
	// TODO this duplicates logic from NFTCaption
	const staticCaption = nft.anchor == 'default' ? 'DEFAULT-NFT' : null

	const onError = (error) => {
		setError(error)

		setTimeout(() => {
			setError()
		}, 3000)
	}

	return (
		<>
			<div className="flex w-9/12 ml-8 mt-8 mb-8">
				<div className="grid">
					<div className="flex items-center justify-center flex-col lg:flex-row">
						<>
							<NFTImageEdit nft={nft} onFinishEditing={onFinishEditing} />
						</>

						<div className="ml-8">
							{staticCaption ? (
								<div className="font-bold text-lg">{staticCaption}</div>
							) : (
								<div>
									{error && (
										<div className="mt-2">
											<Alert type='error' text={error} />
										</div>
									)}
								</div>
							)}

							<div className="py-6 w-full">
								<MetadataBox nft={nft} />
							</div>

							<div className="py-6 w-full">
								<TraitsBox nft={nft} />
							</div>

							<div className="py-6 w-full">
								<AdditionalAssetsBox nft={nft}
									onUpdate={onFinishEditing}
									onError={onError} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default NFTView
