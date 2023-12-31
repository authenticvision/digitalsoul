import React, { useRef } from 'react'
import Image from 'next/image'
import editImg from '@/public/icons/edit.svg'

import { Button } from '@/components/ui'
import { NFTImageUploader } from '@/components/studio'
import { discoverPrimaryAsset, generateAssetURL } from '@/lib/utils'

// TODO: Rename this component
const NFTImageEdit = ({
	nft,
	onStartEditing = () => {},
	onFinishEditing = () => {},
	...props
}) => {
	const editingModal = useRef(null)

	const onEdit = (event) => {
		editingModal.current.showModal()

		onStartEditing()
	}

	const onFinishUploading = (e) => {
		editingModal.current.close()

		onFinishEditing()
	}

	const primaryAsset = discoverPrimaryAsset(nft)
	const assetURL  = primaryAsset ? generateAssetURL(nft.contract.csn, primaryAsset?.asset?.assetHash) : null

	return (
		<div className="relative group">
			<Button btnType="button" onClick={onEdit}
							variant="btn-circle"
							className="absolute z-10 invisible group-hover:visible right-5 top-5 border cursor-pointer hover:shadow-white border-white rounded-full hover:shadow-sm">
				<Image src={editImg} height={35} width={35} />
			</Button>

			<dialog ref={editingModal} id="nft-modal-editing" className="modal">
				<NFTImageUploader nft={nft} onFinish={onFinishUploading} />
			</dialog>

			<div className="relative w-[350px] h-[350px]">
				{primaryAsset ? (
					<Image src={assetURL} fill className="object-cover max-w-sm rounded-lg shadow-2xl" />
				) : (
					<Image src="/nft-fallback-cover.webp" fill className="object-cover max-w-sm rounded-lg shadow-2xl" />)} </div> </div>)
}

export default NFTImageEdit
