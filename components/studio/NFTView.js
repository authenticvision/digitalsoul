import React, { useRef } from 'react'
import Link from 'next/link'
import { formatAddress, generateAssetURL } from '@/lib/utils'
import { TraitsBox, NFTImageUploader } from '@/components/studio'
import editImg from '@/public/icons/edit.svg'
import Image from 'next/image'

const NFTView = ({ nft, wallet, contract, onFinishEditing, ...props }) => {
	const editingModal = useRef(null)

	const onEdit = (event) => {
		editingModal.current.showModal()
	}

	const onFinishUploading = (e) => {
		editingModal.current.close()

		onFinishEditing()
	}

	const hasAssets = nft.assets.length > 0
	const assetURL  = hasAssets ? generateAssetURL(nft.assets[0].assetHash) : null

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
									<li>NFTs</li>
								</ul>
							</div>

							<div className="font-bold text-4xl">
								{nft.slid}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex w-9/12 ml-8 mt-8 mb-8">
				<div className="grid">
					<div className="flex items-center justify-center flex-col lg:flex-row">
						<div className="relative group">
							<button type="button" onClick={onEdit} className="absolute z-10 invisible group-hover:visible right-5 top-5 border cursor-pointer hover:shadow-white border-white rounded-full hover:shadow-sm">
								<Image src={editImg} height={35} width={35} />
							</button>

							<dialog ref={editingModal} id="nft-modal-editing" className="modal">
								<NFTImageUploader anchor={nft.anchor} onFinish={onFinishUploading} />
							</dialog>

							<div className="relative w-[350px] h-[350px]">
								{hasAssets ? (
									<Image src={assetURL} fill className="object-cover max-w-sm rounded-lg shadow-2xl" />
								) : (
									<Image src="/nft-fallback-cover.webp" fill className="object-cover max-w-sm rounded-lg shadow-2xl" />
								)}
							</div>

						</div>

						<div className="ml-8">
							<h1 className="text-2xl text-gray-400">
								owned by <span className="font-bold text-white">
									{formatAddress(wallet.address)}
								</span>
							</h1>
							<div className="py-6 w-full">
								<TraitsBox nft={nft} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default NFTView
