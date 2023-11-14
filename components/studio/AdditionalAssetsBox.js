import { useState, useRef } from 'react'
import { Button, ElementBox } from '@/components/ui'
import { FileUploader } from '@/components/studio'

import { formatAddress } from '@/lib/utils'

import Link from 'next/link'
import Image from 'next/image'
import editImg from '@/public/icons/edit.svg'

// recebe um nft e puxa a lista de assets desse nft
// cospe um evento de mudanças para o parent
// pode remover um asset
// adicionar um novo asset na lista interna

const AdditionalAssetsBox = ({ nft, onUpdate, ...props }) => {
	console.log(nft)

	const [newAssetType, setNewAssetType] = useState('')
	const uploadModal = useRef(null)

	const displayModal = () => {
		uploadModal.current.showModal()
	}

	const onCancelUpload = () => {
	}

	const onFinishUploading = (e) => {
		uploadModal.current.close()

		onUpdate()
	}

	return (
		<ElementBox title="Additional Assets">
			<div className="flex flex-col">
				<ul>
					{nft.assets.map((asset) => (
						<li>
							<div>
								{asset.assetType}:
								<Link className="ml-2 link" target="_blank"
									href={`/api/v1/assets/${asset.assetHash}`}>
										{formatAddress(asset.assetHash)}
								</Link>

								<span className="ml-2 btn btn-ghost btn-xs text-lg">
									×
								</span>
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

							<FileUploader disabled={!newAssetType} endpoint={`/api/internal/assets/${nft.anchor}/${newAssetType}`} maxFiles={1}
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
