import { useState, useRef } from 'react'
import { Button, ElementBox } from '@/components/ui'
import { FileUploader } from '@/components/studio'

import { formatAddress } from '@/lib/utils'

import Link from 'next/link'
import Image from 'next/image'
import editImg from '@/public/icons/edit.svg'

const AdditionalAssetsBox = ({ nft, onUpdate, onError, ...props }) => {
	const [newAssetType, setNewAssetType] = useState('')
	const uploadModal = useRef(null)

	const displayModal = () => {
		uploadModal.current.showModal()
	}

	const onCancelUpload = () => {}

	const onFinishUploading = (e) => {
		uploadModal.current.close()
		setNewAssetType('')

		onUpdate()
	}

	const removeAsset = async (asset) => {
		console.log(asset)

		try {
			const response = await fetch(`/api/internal/assets/${nft.contract.csn}/${nft.anchor}/${asset.assetType}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
				}),
			})

			const data = await response.json()

			if (response.ok) {
				onUpdate()
			} else {
				onError(data.message)
			}
		} catch (error) {
			console.error('Error: ', error)
			onError('There was an error while trying to communicate with the API')
		}
	}

	const onRemoveAsset = async (asset) => {
		await removeAsset(asset)
	}

	return (
		<ElementBox title="Assets">
			<div className="flex flex-col">
				<ul>
					{nft.assets.filter( (obj) => {return obj.active}).map((asset) => (
						<li key={asset.asset.assetHash}>
							<div>
								{asset.assetType}:
								<Link className="ml-2 link" target="_blank"
									href={`/api/v1/assets/${nft.contract.csn}/${asset.asset.assetHash}`}>
										{asset.asset.originalFileName}
								</Link>

								<button onClick={() => onRemoveAsset(asset)}
									className="ml-2 btn btn-ghost btn-sm">
									×
								</button>
							</div>
						</li>
					))}
				</ul>

				<div className="flex mt-4">
					<dialog ref={uploadModal} id="nft-modal-upload" className="modal">
						<div className="modal-box">
							<div className="mb-4 text-center">
								<input type="text" value={newAssetType} onChange={(e) => setNewAssetType(e.target.value)}
									placeholder="Asset Type"
									required
									className="input input-bordered w-full max-w-xs" />
							</div>

							<FileUploader disabled={!newAssetType} endpoint={`/api/internal/assets/${nft.contract.csn}/${nft.anchor}/${newAssetType}`} maxFiles={1}
								onFinish={onFinishUploading} assetType={newAssetType} />

							<div className="modal-action">
								<form method="dialog">
									<button onClick={onCancelUpload} className="btn">Cancel</button>
								</form>
							</div>
						</div>
					</dialog>

					<Button href="#" onClick={displayModal} btnType="button" text="Add new asset" />
				</div>
			</div>
		</ElementBox>
	)
}

export default AdditionalAssetsBox
