import { useState, useEffect, useCallback, useRef } from 'react'
import { Button, ElementBox, SelectableCardList } from '@/components/ui'
import { FileUploader } from '@/components/studio'
import { useAssets } from '@/hooks'
import { Modal } from 'react-daisyui'

import { formatAddress } from '@/lib/utils'

import Link from 'next/link'
import Image from 'next/image'
import editImg from '@/public/icons/edit.svg'

const AdditionalAssetsBox = ({ nft, onUpdate, onError, ...props }) => {
	const [newAssetType, setNewAssetType] = useState('')
	const [newAsset, setNewAsset] = useState('')
	const [displayModal, setDisplayModal] = useState(false)
	const selectAssetModal = useRef(null)
	const { assets, isLoading, error, mutate } = useAssets(nft.contract.csn)

	const toggleDisplayModal = () => {
		setDisplayModal(!displayModal)
	}

	useEffect(() => {
		if (!displayModal) {
			setDisplayModal(false)
			setNewAssetType('')
			mutate()

			onUpdate()
		}
	}, [displayModal])

	const onCancelUpload = () => {}

	const onSelectAsset = (asset) => {
		setNewAsset(asset)
	}

	const saveAdditionalAsset = async () => {
		try {
			const response = await fetch(`/api/internal/assets/${nft.contract.csn}/${nft.anchor}/link`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					assetId: newAsset.id,
					assetType: newAssetType
				})
			})

			const data = await response.json()

			if (response.ok) {
				setDisplayModal(false)
				setNewAssetType('')
				setNewAsset(null)

				onUpdate()
			} else {
				setDisplayModal(false)
				setNewAssetType('')
				setNewAsset(null)

				onError(data.message)
			}
		} catch (error) {
			console.error('Error: ', error)
			onError('There was an error while trying to communicate with the API')
		}
	}

	const removeAsset = async (asset) => {
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
				<p>Refer
					<Link className="ml-1 link"
						href="https://docs.opensea.io/docs/metadata-standards"
						target="blank">OpenSea MetaData Standard</Link>
				</p>
				<ul>
					{nft.assets.filter((obj) => {return obj.active}).map((asset) => (
						<li key={asset.asset.assetHash}>
							<div>
								<Button onClick={() => onRemoveAsset(asset)}
									className="ml-2 btn btn-ghost btn-sm" text="X" />
								{asset.assetType}:
								<Link className="ml-2 link" target="_blank"
									href={`/api/v1/assets/${nft.contract.csn}/${asset.asset.assetHash}`}>
										{asset.asset.originalFileName}
								</Link>
							</div>
						</li>
					))}
				</ul>

				<div className="flex mt-4">
					{displayModal && (
						<Modal.Legacy className="w-8/12 max-w-5xl" open={displayModal} onClickBackdrop={toggleDisplayModal}>
							<Modal.Header className="font-bold text-center">
								Select a new Asset
							</Modal.Header>
							<Modal.Body>
								<div className="mb-4 text-center">
									<input type="text" value={newAssetType}
										onChange={(e) => setNewAssetType(e.target.value)}
										placeholder="Asset Type"
										required
										className="input input-bordered w-full max-w-xs" />
								</div>

								<div>
									<SelectableCardList onSelect={onSelectAsset}
														disabled={!newAssetType}
														items={assets} />
								</div>
							</Modal.Body>
							<Modal.Actions>
								<div className="flex flex-row justify-between w-full">
									<Button onClick={saveAdditionalAsset}>Save</Button>
									<Button onClick={toggleDisplayModal}>Close</Button>
								</div>
							</Modal.Actions>
						</Modal.Legacy>
					)}

					<Button href="#" onClick={toggleDisplayModal} btnType="button" text="Add new asset" />
				</div>
			</div>
		</ElementBox>
	)
}

export default AdditionalAssetsBox
