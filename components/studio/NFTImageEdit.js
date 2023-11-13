import React, { useRef } from 'react'
import Image from 'next/image'
import editImg from '@/public/icons/edit.svg'

import { NFTImageUploader } from '@/components/studio'
import { generateAssetURL } from '@/lib/utils'

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

	const hasAssets = nft.assets?.length > 0
	const assetURL  = hasAssets ? generateAssetURL(nft.assets[0].assetHash) : null

	return (
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
	)
}

export default NFTImageEdit
