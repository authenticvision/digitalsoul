import React, { useState, useEffect } from 'react'
import NextHead from 'next/head'

import { AppLayout, StudioHeader, Loading, ErrorPage, Button } from '@/components/ui'
import { NFTImageEdit } from '@/components/studio'

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
		values: { ...nft, metadataProps: nft?.metadataAsProps}
	})

	const { fields: metadataFields, append: appendMetadata, remove: removeMetadata } = useFieldArray({
		name: 'metadataProps', control
	})

	const nftCaption = nft ? nft.slid == 0 ? 'Default NFT' : nft.slid : anchor

	const onFinishEditing = async () => {
	}

	const onSubmit = (data) => {
		const newMetadata = (data.metadataProps || []).reduce((obj, prop) => {
			obj[prop.name] = prop.value

			return obj
		}, {})

		const combinedMetadata = {
			attributes: nft.metadata?.attributes,
			 ...newMetadata
		}

		if (data.metadata?.name) {
			combinedMetadata.name = data.metadata?.name
		}

		if (data.metadata?.description) {
			combinedMetadata.description = data.metadata?.description
		}

		fetch(`/api/internal/nft/${contract.csn}/${anchor}/edit`, {
			method: 'PUT',
			body: JSON.stringify({
				metadata: combinedMetadata
			})
		})
	}

	const addNewMetadataProp = () => {
		appendMetadata({ name: '', value: '' })
	}

	const removeMetadataProp = (index) => {
		removeMetadata(index)
	}

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
											<div className="flex items-center justify-center items-center">

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
												<h2 className="text-2xl font-bold mb-4">
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
