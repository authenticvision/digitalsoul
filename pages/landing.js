import React, { useState, useEffect, useCallback } from 'react'
import NextHead from 'next/head.js'
import { poll } from '@/lib/landing/utils'
import { generateMetaDataURL, addressMatch } from '@/lib/utils'

import { useSession } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import prisma from "@/lib/prisma"
import MetaAnchor from '@/lib/api.metaanchor.io'
import { auth } from "auth"

import { Alert } from '@/components/ui'
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
			console.error(error)
			errorMsg = 'Error while trying to fetch API, maybe invalid av_sip?'
		}

		// ensure we only store lower-case
		const beneficiary = av_beneficiary.toLowerCase()

		if (assetData) {
			// Only bother with wallet-logic, if the SIP token is valid. This is already some way
			// of authorization preventing DoS or spamming the wallet-table
			// Find wallet, in case it does not exist, persist it (which allows us to later join easily on it
			wallet = await prisma.wallet.findUnique({
				where: {
					address: beneficiary
				},
				select: {
					address: true,
				}
			})

			if (!wallet) {
				// TODO only create wallets with a valid SIP-token and also create one wallet per SIP token
				// this ensures that at max. 1 wallet / scan is created, which prevents DoS / spamming of wallet table

				// FIXME this is duplicate code from wallets/index.js 
				const address = beneficiary
				wallet = await prisma.wallet.upsert({
					where: {
						address
					},
					create: {
						address
					},
					update: {},
					select: {
						address: true,
					}
				})

				if (!wallet) {
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
				const nft = await prisma.NFT.findFirst({
					where: {
						anchor: assetData.anchor,
						contract: {
							csn: assetData.contract.csn
						},
					},
					include: {
						contract: true,
						assets: true
					}
				})

				if (!nft) {
					errorMsg = 'Cannot resolve NFT - database up to date?'
				}

				if (!nft.contract.settings?.CLAIM_UNDEFINED_NFT) {
					try {
						const url = new URL(generateMetaDataURL(nft), process.env.NEXTAUTH_URL).toString()
						const response = await fetch(url);
						const data = await response.json();
						const status = await response.status;
						if (status != 200) {
							errorMsg = "NFT is undefined and cannot be claimed yet. Contact collection owner."
						}
					} catch (error) {
						console.error(`Error fetching NFT-Metadata from ${url}`, error);
						errorMsg = `Error retrieving NFT-Metadata from ${url}`
					}
				}
			}
		}
	} else {
		errorMsg = "GET-Parameters av_sip or av_beneficiary missing!"
		noData = true
	}

	return {
		props: {
			nft,
			wallet,
			assetData,
			noData,
			errorMsg,
			avSip: av_sip || null,
			session: JSON.parse(JSON.stringify(session)) // XXX: NextJS is dumb
		}
	}
}

const LandingNFT = ({ nft, noData, avSip, errorMsg, wallet, assetData, props }) => {
	// Although nft is not used a.t.m, keep it, as we will use it later on
	// e.g. to dynamically upload Images to that NFT BEFORE claiming it.
	const [error, setError] = useState(errorMsg)
	const [newOwner, setNewOwner] = useState()
	const [ownershipStatus, setOwnershipStatus] = useState(
		addressMatch(assetData?.owner, wallet?.address) ? OWNER_STATUS : RECEIVING_STATUS
	)

	const CurrentCard = useCallback(() => {
		switch (ownershipStatus) {
			// TODO add a status "Undefined NFT". In this case, there may be a view,
			// where the user can upload an image, as soon as uploaded, forward to RECEIVING_STATUS
			// and actually claim it
			case OWNER_STATUS:
				return (<OwnerCardView wallet={wallet} assetData={assetData} />)
			case RECEIVING_STATUS:
				return (<ReceivingCardView wallet={wallet} assetData={assetData} />)
			case LOST_STATUS:
				return (<LostCardView wallet={wallet} newOwner={newOwner} />)
			default:
				return (<ReceivingCardView wallet={wallet} assetData={assetData} />)
		}
	}, [ownershipStatus, nft, wallet, assetData, newOwner])

	const nftWasClaimed = (result) => {
		if (addressMatch(wallet.address, result.owner)) {
			return false
		} else {
			return true
		}
	}

	const nftWasTransfered = (result) => {
		if (!addressMatch(wallet.address, result.owner)) {
			return false
		} else {
			return true
		}
	}

	const verifySipToken = async () => {
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
