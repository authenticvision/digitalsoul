import React, { useState, useEffect } from "react"
import NextHead from 'next/head.js'

import { AppLayout, Loading, ErrorPage } from '@/components/ui'
import { NFTView as NFTProfileView } from '@/components/studio'

import { useSession } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { auth } from 'auth'

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

	const { anchor } = context.query

	let nft = await prisma.NFT.findFirst({
		where: {
			anchor: anchor,
			contract: {
				ownerId: session.wallet.id
			}
		},
		include: {
			contract: true
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

	nft = JSON.parse(JSON.stringify(nft))

	const contract = JSON.parse(JSON.stringify(nft.contract))

	return {
		props: {
			anchor,
			wallet,
			contract,
			nft,
		}
	}
}

const NFTView = ({ nft, contract, wallet, anchor, ...props }) => {
	if (props.forbidden) {
		return (
			<ErrorPage status={403} />
		)
	}

	return (
		<>
			<NextHead>
				<title>DigitalSoul - Studio - {nft.slid}</title>
			</NextHead>

			<AppLayout wallet={wallet} contractId={contract.id}>
				<div className="page w-full ">
					<main className="flex flex-col">
						<NFTProfileView wallet={wallet} contract={contract} nft={nft} />
					</main>
				</div>
			</AppLayout>
		</>
	)
}

export default NFTView
