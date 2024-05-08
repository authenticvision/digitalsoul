import React, { useState, useEffect } from 'react'
import NextHead from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useBeforeunload } from 'react-beforeunload'
import { ArrowTopRightOnSquareIcon, TrashIcon, PlusIcon, LinkIcon } from '@heroicons/react/20/solid'

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
				alt="NFT-Image"
				src={asset ? asset : url} />
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

	const [displayLinkAssetModal, setDisplayLinkAssetModal] = useState(false)
	const [displayAddAssetModal, setDisplayAddAssetModal] = useState(false)
	const [allowChangingAssetType, setAllowChangingAssetType] = useState(true)
	const [newAssetType, setNewAssetType] = useState('')
	const [newAsset, setNewAsset] = useState(null)
	const [pendingAdditionalAssets, setPendingAdditionalAssets] = useState({})

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
		pendingAdditionalAssets || isDirty ? (event) => event.preventDefault() : null
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
		.filter((obj) => { return obj.active })

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

		let preparedAdditionalAssets = [];
		if(pendingAdditionalAssets) {
			preparedAdditionalAssets = Object.entries(pendingAdditionalAssets).map(( [key, asset], index) => {

				console.log(asset)
				return {
					assetType: asset.assetType,
					assetId: asset.asset.id,
					assetHash: asset.asset.assetHash
				}
			})
		}

		const formData = new FormData()
		formData.append('metadata', JSON.stringify(combinedMetadata))
		formData.append('additionalAssets', JSON.stringify(preparedAdditionalAssets))

		await fetch(`/api/internal/nft/${contract.csn}/${anchor}/edit`, {
			method: 'PUT',
			body: formData
		})

		setPendingAdditionalAssets({})
		resetModals()

		mutate()
	}

	const onReset = async (data) => {
		setPendingAdditionalAssets({})
		mutate()
	}

	const toggleLinkAssetModal = () => {
		if(displayLinkAssetModal) {
			resetModals();
		}
		setDisplayLinkAssetModal(!displayLinkAssetModal)
	}

	const resetModals = () => {
		setNewAssetType('')
		setNewAsset(null)
		setAllowChangingAssetType(true)
	}


	const toggleAddAssetModal = () => {
		if(displayAddAssetModal) {
			resetModals();
		}
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

	const onSelectAsset = (asset) => {
		setNewAsset(asset)
	}

	const saveAdditionalAsset = (asset) => {
		setPendingAdditionalAssets(pendingAdditionalAssets => ({
			...pendingAdditionalAssets,
			[newAssetType]: {
				assetType: newAssetType,
				asset: newAsset
			}
		}));

		if(newAssetType == "image") {
			mutate();
		}
		setDisplayLinkAssetModal(false)
		resetModals()		
	}

	const getImageUrl = () => {

		// Priority 1: Pending assets (these are non-applied changes)
		for(let assetType in pendingAdditionalAssets) {
			const entry = pendingAdditionalAssets[assetType]
			if(entry.assetType == 'image') {
				let url = entry.asset.assetURL
				if(!url) {
					// The image is already uploaded at the time, even if there is no URL generated yet
					// due to lacking DB-Entry
					url = `/api/v1/assets/${contract.csn}/${entry.asset.assetHash}`
				}
				return url;
			}
		}

		// Priority 2: The primary asset-URL as queried from the NFT
		if(assetURL) {
			return assetURL;
		}
		
		// Priority 3: Fallback / empty
		return '/nft-fallback-cover.webp'
	}

	const addNewAsset = () => {
		toggleAddAssetModal()
	}

	const addNewImage = () => {
		setNewAssetType("image")
		setAllowChangingAssetType(false)
		addNewAsset()
	}

	const linkExistingImage = () => {
		setNewAssetType("image")
		setAllowChangingAssetType(false)
		setDisplayLinkAssetModal(true)
	}

	const onFinishUpload = (files) => {
		setDisplayAddAssetModal(false)

		const file = JSON.parse(files[0].serverId).asset
		setPendingAdditionalAssets(pendingAdditionalAssets => ({
			...pendingAdditionalAssets,
			[newAssetType]: {
				assetType: newAssetType,
				asset: file
			}
		}));

		setNewAssetType('')
	}

	function isEmpty(obj) {
		if (obj == null) { 
			return true;
		}
	
		// Then proceed to check for properties
		return Object.keys(obj).length === 0;
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
		setPendingAdditionalAssets(pendingAdditionalAssets => {
			const filteredEntries = Object.entries(pendingAdditionalAssets).filter(([key, value]) => 
				value.asset.assetHash !== asset.asset.assetHash
			);
		
			// Convert the filtered entries back into an object
			const newAssets = Object.fromEntries(filteredEntries);
			return newAssets;
		});
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
										<form onSubmit={handleSubmit(onSubmit)} onReset={onReset}>
											<div className="mt-2 flex flex-col items-center justify-center items-center">
												<div className="relative">
													<ImageCard url={getImageUrl()} />
													{/* Icons overlay */}
													<div className="absolute top-0 right-0 flex space-x-2 p-2">
														<Button btnType="button" onClick={linkExistingImage} className="btn-ghost">
																<LinkIcon className="h-6 w-6" />
														</Button>
														<Button btnType="button" onClick={addNewImage} className="btn-ghost">
																<PlusIcon className="h-6 w-6" />
														</Button>
													</div>
												</div>
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

											<div className="form-control my-4 w-full">
												<h2 className="text-2xl font-bold my-4">
													Assets
												</h2>
												<div className="w-full text-end">
													<Button btnType="button" onClick={toggleLinkAssetModal} className="btn-ghost">
														<LinkIcon className="h-6 w-6" />
													</Button>
													<Button btnType="button" onClick={addNewAsset} className="btn-ghost">
														<PlusIcon className="h-6 w-6" />
													</Button>													
												</div>
												<div>
													
													{(additionalAssets.length > 0 || !isEmpty(pendingAdditionalAssets)) && (
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

																{Object.entries(pendingAdditionalAssets).map(([key, asset], index) => (
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
												<div className="flex mt-4">
													{displayLinkAssetModal && (
														<Modal.Legacy className="w-8/12 max-w-5xl" open={displayLinkAssetModal} onClickBackdrop={toggleLinkAssetModal}>
															<Modal.Header className="font-bold text-center">
																Link asset <i><u>{newAssetType}</u></i>
															</Modal.Header>
															<Modal.Body>
																<div className="mb-4 text-center">
																	<input type="text" value={newAssetType}
																		onChange={(e) => setNewAssetType(e.target.value)}
																		placeholder="Asset Type"
																		hidden={!allowChangingAssetType}
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
																Upload asset <i><u>{newAssetType}</u></i>
															</Modal.Header>
															<Modal.Body>
																<div className="mb-4 text-center">
																	<div className="mb-4 text-center">
																		<input type="text" value={newAssetType}
																			onChange={(e) => setNewAssetType(e.target.value)}
																			placeholder="Asset Type"
																			hidden={!allowChangingAssetType}
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
												<Button btnType="reset" className="">
													Cancel
												</Button>

												<Button btnType="submit" className="">
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
