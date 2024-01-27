import React, { useState, useEffect } from 'react'
import NextHead from 'next/head'

import { AppLayout, StudioHeader, Loading, ErrorPage, Button } from '@/components/ui'
import { NFTImageEdit } from '@/components/studio'

import { auth } from 'auth'

import { useNFT } from '@/hooks'
import prisma from '@/lib/prisma'

import { useForm, SubmitHandler } from "react-hook-form"

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
		register, handleSubmit, watch, formState: { errors }
	}  = useForm()

	const nftCaption = nft ? nft.slid == 0 ? 'Default NFT' : nft.slid : anchor

	const onFinishEditing = async () => {
		await mutate()
	}

	const onSubmit = (data) => {
		console.log(data)
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
								<StudioHeader contract={contract} nft={nft} staticCaption={nftCaption} />

								<div className="flex mx-8 mt-8 mb-8">
									<div className="grid w-full">
										<form onSubmit={handleSubmit(onSubmit)}>
											<div className="flex items-center justify-center items-center">
												<NFTImageEdit nft={nft} onFinishEditing={onFinishEditing} />
											</div>

											<div className="form-control my-4 md:w-3/12">
												<label className="m-1">Name</label>
												<input
													className="input input-bordered"
													type="text"
													{...register("name", {
														required: "This field is required",
													})}
												/>
												<span className="text-red-600 mt-2">
													{errors?.name?.message}
												</span>
											</div>

											<div className="form-control my-4">
												<label className="m-1">Description</label>
												<textarea
													className="textarea textarea-bordered"
													rows={5}
													style={{ verticalAlign: "top" }}
													{...register("description", {
														required: "This field is required",
													})}
												/>

												<span className="text-red-600 mt-2">
													{errors?.description?.message}
												</span>
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
