import React, { useState, useEffect } from 'react'
import NextHead from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import editImg from '@/public/icons/edit.svg'
import { ArrowTopRightOnSquareIcon, TrashIcon, XMarkIcon, PencilIcon } from '@heroicons/react/20/solid'

import { AppLayout, StudioHeader, Loading, ErrorPage, Button } from '@/components/ui'
import { Table } from 'react-daisyui'
import { discoverPrimaryAsset, generateAssetURL } from '@/lib/utils'

import { auth } from 'auth'

import { useNFT } from '@/hooks'
import prisma from '@/lib/prisma'

import { useForm, useFieldArray, SubmitHandler } from "react-hook-form"

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
	if (props.forbidden) {
		return (
			<ErrorPage status={403} />
		)
	}

	const { nft, isLoading, error, mutate } = useNFT({
		csn: contract.csn, anchor: anchor
	})

	const {
		register, handleSubmit, control, formState: { errors }
	}  = useForm({
		values: {
			...nft,
			attributes: nft?.metadata?.attributes,
			metadataProps: nft?.metadataAsProps
		}
	})

	const [selectedImage, setSelectedImage] = useState(null)

	const { fields: metadataFields, append: appendMetadata, remove: removeMetadata } = useFieldArray({
		name: 'metadataProps', control
	})

	const { fields: traitFields, append: appendTrait, remove: removeTrait } = useFieldArray({
		name: 'attributes', control
	})

	const nftCaption = nft ? nft.slid == 0 ? 'Default NFT' : nft.slid : anchor

	const additionalAssets = nft?.assets
		.filter((obj) => { return obj.active && obj.assetType !== 'image' })

	const onSubmit = (data) => {
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

		const formData = new FormData()
		formData.append('metadata', JSON.stringify(combinedMetadata))
		formData.append('image', selectedImage)

		fetch(`/api/internal/nft/${contract.csn}/${anchor}/edit`, {
			method: 'PUT',
			body: formData
		})
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
		} catch (error) {
			console.error('Error: ', error)
		}
	}

	const primaryAsset = discoverPrimaryAsset(nft)
	const assetURL = primaryAsset ? generateAssetURL(nft?.contract.csn, primaryAsset?.asset?.assetHash) : null

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

														{(traitFields.length > 1) && (
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
													{additionalAssets.length > 0 && (
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
													<Button btnType="button" onClick={addNewTraitProp} className="w-1/2 mt-2 mr-2">
														Add a new asset
													</Button>

													<Button btnType="button" onClick={addNewTraitProp} className="w-1/2 mt-2">
														Link to Existing Asset
													</Button>
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
