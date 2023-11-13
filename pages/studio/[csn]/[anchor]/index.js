import React, { useState, useEffect } from 'react'
import NextHead from 'next/head'

import { AppLayout, Loading, ErrorPage } from '@/components/ui'
import { NFTView as NFTProfileView } from '@/components/studio'

import { useSession } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { auth } from 'auth'

import { useNFT } from '@/hooks'
import prisma from '@/lib/prisma'

export async function getServerSideProps(context) {
	const session = await auth(context.req, context.res)
	let nfts = []

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

	const wallet = { id: session.wallet.id, address: session.wallet.address }

	const contract = JSON.parse(JSON.stringify(nft.contract))

	return {
		props: {
			anchor,
			wallet,
			contract
		}
	}
}


const NFTView = ({ contract, wallet, anchor, ...props }) => {
	if (props.forbidden) {
		return (
			<ErrorPage status={403} />
		)
	}

	const { nft, isLoading, error, mutate } = useNFT({csn: contract.csn, anchor: anchor})
	const nftCaption = nft ? nft.slid == 0 ? 'Default NFT' : nft.slid : anchor

	const onFinishEditing = () => {
		mutate()
	}

	return (
		<>
			<NextHead>
				<title>DigitalSoul - Studio - {nftCaption} </title>
			</NextHead>

			<AppLayout wallet={wallet} contractId={contract.id}>
				<div className="page w-full ">
					<main className="flex flex-col">
						{nft ? (
							<NFTProfileView wallet={wallet} contract={contract}
											nft={nft} onFinishEditing={onFinishEditing} />
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

export default NFTView
