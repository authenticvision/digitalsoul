import React, { useState, useEffect } from 'react'
import NextHead from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useBeforeunload } from 'react-beforeunload'
import { ArrowTopRightOnSquareIcon, TrashIcon, XMarkIcon, PencilIcon } from '@heroicons/react/20/solid'

import { AppLayout, StudioHeader, Loading, ErrorPage, Button, SelectableCardList } from '@/components/ui'
import { FileUploader } from '@/components/studio'
import { Table, Modal } from 'react-daisyui'
import { discoverPrimaryAsset, generateAssetURL } from '@/lib/utils'

import { auth } from 'auth'

import { useNFT, useAssets } from '@/hooks'
import prisma from '@/lib/prisma'

import { useForm, useFieldArray, SubmitHandler } from "react-hook-form"
import { set } from 'zod'

export async function getServerSideProps(context) {
	const session = await auth(context.req, context.res)

	if (!session) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			}
		}
	}

	const { csn, anchor } = context.query

	let nft = await prisma.NFT.findFirst({
		where: {
			anchor: anchor,
			contract: {
				csn: {
					equals: csn,
					mode: "insensitive"
				},
				ownerId: session.wallet.id
			}
		},
		include: {
			contract: true,
		}
	})

	if (!nft) {
		return {
			props: {
				forbidden: true
			}
		}
	}

	const wallet = {
		id: session.wallet.id,
		address: session.wallet.address?.toLowerCase()
	}

	const contract = JSON.parse(JSON.stringify(nft.contract))

	return {
		props: {
			anchor,
			wallet,
			contract
		}
	}
}

const ImageCard = ({ asset, url, ...props }) => {
	return (
		<div className="relative group">
			<Image
				className="h-auto max-w-full rounded-lg"
				width={500}
				height={500}
				src={asset ? asset : url} />

			{url && (
				<label htmlFor="image"
					className="w-[3rem] h-[3rem] flex items-center justify-center absolute z-10 invisible group-hover:visible right-5
					top-5 border cursor-pointer btn btn-circle hover:shadow-white border-white
					hover:shadow-sm">
						<PencilIcon className="w-6 h-6"/>
				</label>
			)}
		</div>
	)
}

const NFTEdit = ({ contract, wallet, anchor, ...props }) => {
	const router = useRouter()

	if (props.forbidden) {
		return (
			<ErrorPage status={403} />
		)
	}

	const [selectedImage, setSelectedImage] = useState(null)
	const [displayLinkAssetModal, setDisplayLinkAssetModal] = useState(false)
	const [displayAddAssetModal, setDisplayAddAssetModal] = useState(false)
	const [newAssetType, setNewAssetType] = useState('')
	const [newAsset, setNewAsset] = useState(null)
	const [pendingAdditionalAssets, setPendingAdditionalAssets] = useState([])

	const { nft, isLoading, error, mutate } = useNFT({
		csn: contract.csn, anchor: anchor
	})

	const { assets, isLoading: isLoadingAssets, error: errorAssets } = useAssets(
		contract.csn
	)

	const {
		register, handleSubmit, control, formState: { errors, isDirty }
	}  = useForm({
		values: {
			...nft,
			attributes: nft?.metadata?.attributes,
			metadataProps: nft?.metadataAsProps
		}
	})

	const { fields: metadataFields, append: appendMetadata, remove: removeMetadata } = useFieldArray({
		name: 'metadataProps', control
	})

	const { fields: traitFields, append: appendTrait, remove: removeTrait } = useFieldArray({
		name: 'attributes', control
	})

	useBeforeunload(
		pendingAdditionalAssets.length > 0 || isDirty ? (event) => event.preventDefault() : null
	);

	useEffect(() => {
        const exitingFunction = () => {
			const warningText = 'This page is asking you to confirm that you want to leave — information you’ve entered may not be saved.'
			const pendingChanges = isDirty || pendingAdditionalAssets.length > 0

			if (!pendingChanges) {
				return
			}

			if (!window.confirm(warningText)) {
				router.events.emit('routeChangeError');
				throw 'routeChange aborted.';
			}
        };

        router.events.on('routeChangeStart', exitingFunction);

        return () => {
            router.events.off('routeChangeStart', exitingFunction);
        };
    }, [isDirty, pendingAdditionalAssets]);

	const nftCaption = nft ? nft.slid == 0 ? 'Default NFT' : nft.slid : anchor

	const additionalAssets = nft?.assets
		.filter((obj) => { return obj.active && obj.assetType !== 'image' })

	const onSubmit = async (data) => {
		const newMetadata = (data.metadataProps || []).reduce((obj, prop) => {
			obj[prop.name] = prop.value

			return obj
		}, {})

		const combinedMetadata = {
			 ...newMetadata
		}

		if (data.metadata?.name) {
			combinedMetadata.name = data.metadata?.name
		}

		if (data.metadata?.description) {
			combinedMetadata.description = data.metadata?.description
		}

		combinedMetadata.attributes = data.attributes

		const preparedAdditionalAssets = pendingAdditionalAssets.map((asset) => {
			return {
				assetType: asset.assetType,
				assetId: asset.asset.id,
				assetHash: asset.asset.assetHash
			}
		})

		const formData = new FormData()
		formData.append('metadata', JSON.stringify(combinedMetadata))
		formData.append('image', selectedImage)
		formData.append('additionalAssets', JSON.stringify(preparedAdditionalAssets))

		await fetch(`/api/internal/nft/${contract.csn}/${anchor}/edit`, {
			method: 'PUT',
			body: formData
		})

		setPendingAdditionalAssets([])
		setSelectedImage(null)
		setNewAsset(null)
		setNewAssetType('')

		mutate()
	}

	const toggleLinkAssetModal = () => {
		setNewAssetType('')
		setDisplayLinkAssetModal(!displayLinkAssetModal)
	}

	const toggleAddAssetModal = () => {
		setDisplayAddAssetModal(!displayAddAssetModal)
	}

	const addNewMetadataProp = () => {
		appendMetadata({ name: '', value: '' })
	}

	const removeMetadataProp = (index) => {
		removeMetadata(index)
	}

	const addNewTraitProp = () => {
		appendTrait({ trait_type: '', value: '' })
	}

	const removeTraitProp = (index) => {
		removeTrait(index)
	}

	const handleFileChange = (e) => {
		const file = e.target.files[0]

		setSelectedImage(file)
	}

	const handleRemoveImage = () => {
		setSelectedImage(null)
	}

	const onSelectAsset = (asset) => {
		setNewAsset(asset)
	}

	const saveAdditionalAsset = (asset) => {
		setPendingAdditionalAssets([...pendingAdditionalAssets, {
			assetType: newAssetType,
			asset: newAsset
		}])

		setDisplayLinkAssetModal(false)
		setNewAssetType('')
		setNewAsset(null)
	}

	const addNewAsset = () => {
		toggleAddAssetModal()
	}

	const onFinishUpload = (files) => {
		setDisplayAddAssetModal(false)

		const file = JSON.parse(files[0].serverId).asset
		setPendingAdditionalAssets([...pendingAdditionalAssets, {
			assetType: newAssetType,
			asset: file
		}])

		setNewAssetType('')
	}

	const removeAdditionalAsset = async (asset) => {
		try {
			const response = await fetch(`/api/internal/assets/${contract.csn}/${anchor}/${asset.assetType}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
				}),
			})

			if (response.ok) {
				mutate()
			}
		} catch (error) {
			console.error('Error: ', error)
		}
	}

	const removePendingAdditionalAsset = (asset) => {
		setPendingAdditionalAssets(
			pendingAdditionalAssets
				.filter((obj) => obj.asset.assetHash !== asset.asset.assetHash)
		)
	}

	const primaryAsset = discoverPrimaryAsset(nft)
	const assetURL = primaryAsset ? generateAssetURL(nft?.contract.csn, primaryAsset?.asset?.assetHash) : null
	const availableAssets = assets?.filter((asset) => {
		return !additionalAssets?.find((obj) => obj.asset.assetHash === asset.assetHash)
	})

	return (
		<>
			<NextHead>
				<title>DigitalSoul - Studio - Editing {nftCaption}</title>
			</NextHead>

			<AppLayout wallet={wallet} contractId={contract.id}>
				<div className="page w-full">
					<main className="flex flex-col">
						{nft ? (
							<>
								<StudioHeader title={`Editing ${nftCaption}`}
											contract={contract} nft={nft}
											staticCaption={nftCaption} />

								<div className="flex m-8">
									<div className="grid w-full px-8">
										<form onSubmit={handleSubmit(onSubmit)}>
											<div className="flex flex-col items-center justify-center items-center">
												<input id="image" className="hidden" type="file" onChange={handleFileChange} />
												{selectedImage && (
													<div className="mt-2 relative group">
														<ImageCard
															asset={URL.createObjectURL(selectedImage)}
														/>

														<Button btnType='button'
															variant="btn-circle"
															onClick={handleRemoveImage}
															className="absolute z-10 invisible group-hover:visible right-5
																top-5 border cursor-pointer hover:shadow-white border-white
																rounded-full hover:shadow-sm"
															aria-label="Remove image">
															<XMarkIcon
																className="w-8 h-8"/>
														</Button>
													</div>
												)}

												{!selectedImage && (
													<div className="mt-2">
														<ImageCard
															url={assetURL || '/nft-fallback-cover.webp'}
														/>
													</div>
												)}

											</div>

											<div className="form-control my-4 md:w-3/12">
												<label className="m-1">Name</label>
												<input
													className="input input-bordered"
													type="text"
													{...register("metadata.name")}
												/>
												<span className="text-red-600 mt-2">
													{errors?.metadata?.name?.message}
												</span>
											</div>

											<div className="form-control my-4">
												<label className="m-1">Description</label>
												<textarea
													className="textarea textarea-bordered"
													rows={5}
													style={{ verticalAlign: "top" }}
													{...register("metadata.description")}
												/>

												<span className="text-red-600 mt-2">
													{errors?.metadata?.description?.message}
												</span>
											</div>

											<div className="form-control my-4">
												<h2 className="text-2xl font-bold my-4">
													Metadata
												</h2>

												{metadataFields.map((field, index) => (
													<div key={field.id} className="flex flex-row w-full">
														<input
															className="input input-bordered mr-2 mb-2"
															type="text"
															{...register(`metadataProps.${index}.name`)}
														/>

														<input
															className="input input-bordered"
															type="text"
															{...register(`metadataProps.${index}.value`)}
														/>

														{(metadataFields.length > 1) && (
															<Button btnType="button"
																onClick={removeMetadataProp} className="ml-2">
																	Remove
																</Button>
														)}
													</div>
												))}

												<Button btnType="button" onClick={addNewMetadataProp} className="mt-2">
													Add a new property
												</Button>
											</div>


											<div className="form-control my-4">
												<h2 className="text-2xl font-bold my-4">
													Traits
												</h2>

												{traitFields.map((field, index) => (
													<div key={field.id} className="flex flex-row w-full">
														<input
															className="input input-bordered mr-2 mb-2"
															type="text"
															placeholder="Trait Type"
															{...register(`attributes.${index}.trait_type`)}
														/>

														<input
															className="input input-bordered"
															type="text"
															placeholder="Value"
															{...register(`attributes.${index}.value`)}
														/>

														{(traitFields.length > 0) && (
															<Button btnType="button"
																onClick={removeTraitProp} className="ml-2">
																	Remove
																</Button>
														)}
													</div>
												))}

												<Button btnType="button" onClick={addNewTraitProp} className="mt-2">
													Add a new trait
												</Button>
											</div>

											<div className="form-control my-4">
												<h2 className="text-2xl font-bold my-4">
													Additional Assets
												</h2>

												<div>
													{(additionalAssets.length > 0 || pendingAdditionalAssets.length > 0) && (
														<Table zebra={true}>
															<Table.Head>
																<span />
																<span>Asset Type</span>
																<span>Original File Name</span>
																<span>Asset Hash</span>
																<span></span>
															</Table.Head>

															<Table.Body>
																{additionalAssets.map((asset, index) => (
																	<Table.Row key={asset.asset.assetHash}>
																		<span>{index + 1}</span>
																		<span>{asset.assetType}</span>
																		<span>{asset.asset.originalFileName}</span>
																		<span>{asset.asset.assetHash}</span>

																		<span>
																			<Link className="link"
																				  target="_blank"
																				  href={`/api/v1/assets/${nft.contract.csn}/${asset.asset.assetHash}`}>
																				<ArrowTopRightOnSquareIcon />
																			</Link>
																		</span>

																		<span>
																			<Button btnType="button" className="btn-ghost" onClick={() => removeAdditionalAsset(asset)}>
																				<TrashIcon className="h-4 text-red-500" />
																			</Button>
																		</span>
																	</Table.Row>
																))}

																{pendingAdditionalAssets.map((asset, index) => (
																	<Table.Row key={index}>
																		<span>
																			<div className="badge badge-secondary">
																				Pending
																			</div>
																		</span>
																		<span>{asset.assetType}</span>
																		<span>{asset.asset.originalFileName}</span>
																		<span>{asset.asset.assetHash}</span>

																		<span>
																			<Link className="link"
																				  target="_blank"
																				  href={`/api/v1/assets/${nft.contract.csn}/${asset.asset.assetHash}`}>
																				<ArrowTopRightOnSquareIcon />
																			</Link>
																		</span>

																		<span>
																			<Button btnType="button" className="btn-ghost"
																					onClick={() => removePendingAdditionalAsset(asset)}>
																				<TrashIcon className="h-4 text-red-500" />
																			</Button>
																		</span>
																	</Table.Row>
																))}
															</Table.Body>
														</Table>
													)}

													{additionalAssets.length === 0 && (
														<div className="text-center my-4">
															This NFT does not have any additional assets
														</div>
													)}
												</div>

												<div className="flex flex-row w-full">
													<Button btnType="button" onClick={addNewAsset} className="w-1/2 mt-2 mr-2">
														Add a new asset
													</Button>

													<Button btnType="button" onClick={toggleLinkAssetModal} className="w-1/2 mt-2">
														Link to Existing Asset
													</Button>
												</div>

												<div className="flex mt-4">
													{displayLinkAssetModal && (
														<Modal.Legacy className="w-8/12 max-w-5xl" open={displayLinkAssetModal} onClickBackdrop={toggleLinkAssetModal}>
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
																		items={availableAssets} />
																</div>
															</Modal.Body>
															<Modal.Actions>
																<div className="flex flex-row justify-between w-full">
																	<Button onClick={toggleLinkAssetModal} btnType='button'>Close</Button>
																	<Button onClick={saveAdditionalAsset} btnType='button'>Save</Button>
																</div>
															</Modal.Actions>
														</Modal.Legacy>
													)}

													{(!displayLinkAssetModal && displayAddAssetModal) && (
														<Modal.Legacy className="w-8/12 max-w-5xl" open={displayAddAssetModal} onClickBackdrop={toggleAddAssetModal}>
															<Modal.Header className="font-bold text-center">
																Upload a new Asset
															</Modal.Header>
															<Modal.Body>
																<div className="mb-4 text-center">
																	<div className="mb-4 text-center">
																		<input type="text" value={newAssetType}
																			onChange={(e) => setNewAssetType(e.target.value)}
																			placeholder="Asset Type"
																			required
																			className="input input-bordered w-full max-w-xs" />
																	</div>

																	<FileUploader disabled={!newAssetType} endpoint={`/api/internal/contract/${contract.csn}/asset`}
																		maxFiles={1} allowMultiple={false} onFinish={onFinishUpload}
																	/>
																</div>
															</Modal.Body>
															<Modal.Actions>
																<div className="flex flex-row justify-between w-full">
																	<Button onClick={toggleAddAssetModal} btnType='button'>Close</Button>
																</div>
															</Modal.Actions>
														</Modal.Legacy>
													)}
												</div>
											</div>


											<div className="flex flex-row justify-between">
												<Button type="reset" className="">
													Cancel
												</Button>

												<Button type="submit" className="">
													Save
												</Button>
											</div>
										</form>
									</div>
								</div>
							</>
						) : (
							<div className='text-center'>
								<Loading size='lg' />
							</div>
						)}
					</main>
				</div>
			</AppLayout>
		</>
	)

}

export default NFTEdit
