import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import NextHead from 'next/head.js'
import { wait, poll } from '@/lib/landing/utils'

import { useSession } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import prisma from "@/lib/prisma"
import MetaAnchor from '@/lib/api.metaanchor.io'
import { auth } from "auth"

import { Alert, Button } from '@/components/ui'
import { Layout, OwnerCardView, ReceivingCardView, LostCardView } from '@/components/landing'

const OWNER_STATUS = 'owner'
const RECEIVING_STATUS = 'receiving'
const LOST_STATUS = 'lost'

export async function getServerSideProps(context) {
	// TODO: Maybe move most of this stuff into it's own module
	let nft = null
	let errorMsg = null
	let assetData = null
	let noData = false
	let wallet = null

	const config = await prisma.config.findFirst()
	const metaAnchorApiURL = process.env.METAANCHOR_API_URL
	const session = await auth(context.req, context.res)

	const api = new MetaAnchor({
		baseUrl: metaAnchorApiURL,
		apiKey: config.apiKey
	})

	const { av_sip, av_beneficiary } = context.query

	if (av_sip && av_beneficiary) {
		// Check the SIP-Token has been signed by a trusted source
		try {
			const { data: assetResponse, status } = await api.getAssetBySip(av_sip)
			assetData = assetResponse
		} catch (error) {
			errorMsg = 'Error while trying to fetch API, maybe invalid av_sip?'
		}

		if (assetData) {
			// Only bother with wallet-logic, if the SIP token is valid. This is already some way
			// of authorization preventing DoS or spamming the wallet-table
			// Find wallet, in case it does not exist, persist it (which allows us to later join easily on it
			wallet = await prisma.wallet.findUnique({
				where: {
					address: av_beneficiary
				},
				select: {
					address: true,
				}
			})

			if (!wallet) {	
				// TODO only create wallets with a valid SIP-token and also create one wallet per SIP token
				// this ensures that at max. 1 wallet / scan is created, which prevents DoS / spamming of wallet table

				// FIXME this is duplicate code from wallets/index.js 
				const address = av_beneficiary
				let walletResult = await prisma.wallet.upsert({
					where: {
						address
					},
					create: {
						address
					},
					update: {},
				})

				if(!walletResult) {
					errorMsg = "Could not create wallet"
				}
			} else {
				try {
					const { data: assetResponse, status } = await api.getAssetBySip(av_sip)
					assetData = assetResponse
				} catch (error) {
					errorMsg = 'Error while trying to fetch API'
				}

				// TODO: Sanitize and validate the assetData.anchor is a valid
				// anchor, raw queries are sanitized by default
				const nftResults = await prisma.$queryRaw`
					SELECT slid, metadata, anchor, contracts.address AS contract_address,
					contracts.name AS contract_name, contracts.csn AS contract_csn
					FROM nfts
					INNER JOIN contracts ON contracts.id = nfts.contract_id
					WHERE nfts.anchor = ${assetData.anchor} LIMIT 1
				`;

				if (nftResults.length == 1) {
					nft = nftResults[0]
				} else {
					errorMsg = 'There are two NFTs locally, database is broken'
				}
			}
		}
	} else {
		noData = true
	}

	return {
		props: {
			nft,
			wallet,
			assetData,
			noData,
			errorMsg,
			avSip: av_sip,
			session: JSON.parse(JSON.stringify(session)) // XXX: NextJS is dumb
		}
	}
}

const LandingNFT = ({ nft, noData, avSip, errorMsg, wallet, assetData, props }) => {
	const [error, setError] = useState(errorMsg)
	const [newOwner, setNewOwner] = useState()
	const [ownershipStatus, setOwnershipStatus] = useState(
		assetData.owner == wallet.address ? OWNER_STATUS : RECEIVING_STATUS
	)
	
	const CurrentCard = useCallback(() => {
		switch(ownershipStatus) {
			case OWNER_STATUS:
				return (<OwnerCardView wallet={wallet} assetData={assetData} nft={nft} />)
			case RECEIVING_STATUS:
				return (<ReceivingCardView wallet={wallet} assetData={assetData} nft={nft} />)
			case LOST_STATUS:
				return (<LostCardView wallet={wallet} newOwner={newOwner} nft={nft} />)
			default:
				return (<ReceivingCardView wallet={wallet} assetData={assetData} nft={nft} />)
		}
	}, [ownershipStatus, nft, wallet, assetData, newOwner])

	const nftWasClaimed = (result) => {
		if (wallet.address == result.owner) {
			return false
		} else {
			return true
		}
	}

	const nftWasTransfered = (result) => {
		if (wallet.address != result.owner) {
			return false
		} else {
			return true
		}
	}

	const verifySipToken = async() => {
		const response = await fetch('/api/internal/landing/verify', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				avSip
			})
		})

		return response.json()
	}

	const claimNFT = async () => {
		const response = await fetch('/api/internal/landing/claim', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				avSip,
				address: wallet.address
			})
		})

		const data = response.json()

		if (response.ok) {
			await poll(verifySipToken, nftWasClaimed, 3000)

			setOwnershipStatus(OWNER_STATUS)
		} else {
			setError('Something went wrong when trying to claim NFT')
		}
	}

	const checkNFTOwnership = async () => {
		const result = await poll(verifySipToken, nftWasTransfered, 3000)

		setNewOwner(result.owner)
		setOwnershipStatus(LOST_STATUS)
	}

	useEffect(() => {
		if (!error) {
			if (ownershipStatus == RECEIVING_STATUS) {
				claimNFT()
			} else if (ownershipStatus == OWNER_STATUS) {
				checkNFTOwnership()
			}
		}
	}, [ownershipStatus])

	return (
		<Layout>
			<NextHead>
				<title>DigitalSoul - Landing</title>
			</NextHead>

			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col">
					<div className="flex justify-center py-2">
						{error && (
							<Alert type='error' text={error} />
						)}
					</div>

					{!error && (
						<div className="flex justify-center py-2 flex-col">
							<CurrentCard nft={nft} assetData={assetData} wallet={wallet} />
						</div>
					)}
				</main>
			</div>
		</Layout>
	)
}

export default LandingNFT
