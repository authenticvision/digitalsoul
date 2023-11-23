import React, { useRef } from 'react'
import Link from 'next/link'
import { TraitsBox, MetadataBox, NFTImageEdit, NFTCaption } from '@/components/studio'
import { formatAddress, generateAssetURL } from '@/lib/utils'
import { AdditionalAssetsBox, TraitsBox, MetadataBox, NFTImageEdit, NFTCaption } from '@/components/studio'
import Image from 'next/image'

// TODO: Split this component into two, a standalone header & the body
const NFTView = ({ nft, wallet, contract, onFinishEditing, ...props }) => {

	// There is a special anchor called 'default'.. In this case, it's a collection's default NFT
	// and does not have an actual SLID or actual anchor.
	// TODO this duplicates logic from NFTCaption
	const staticCaption = nft.anchor == 'default' ? 'DEFAULT-NFT' : null

	return (
		<>
			<div className="flex border-b border-raven-700">
				<div className="flex w-full ml-8 mt-8">
					<div className="flex flex-row justify-between items-center w-full pl-8 pb-8">
						<div className="flex flex-col items-start">
							<div className="text-gray-400 text-sm font-normal breadcrumbs">
								<ul>
									<li>
										<Link href={`/studio/${contract.csn.toLowerCase()}`}>
											{contract.name}
										</Link>
									</li>
									<li>
										<Link href={`/studio/${contract.csn.toLowerCase()}`}>
											Collection
										</Link>
									</li>
								</ul>
							</div>

							<div className="font-bold text-4xl">
								{staticCaption? staticCaption : nft.slid}
							</div>
						</div>
					</div>
				</div>
			</div>

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
								<div >
									<NFTCaption nft={nft} />
									<h2 className="text-1xl text-gray-400">
										owned by <span className="font-bold text-white">
											sooon
										</span>
									</h2>

								</div>
							)}

							<div className="py-6 w-full">
								<MetadataBox nft={nft} onFinish={onFinishEditing} />
							</div>

							<div className="py-6 w-full">
								<TraitsBox nft={nft} />
							</div>

							<div className="py-6 w-full">
								<AdditionalAssetsBox nft={nft} onUpdate={onFinishEditing} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default NFTView
