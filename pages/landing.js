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
	let beneficiary = null
	let verifyData = null

	if (av_sip && av_beneficiary) {
		// Check the SIP-Token has been signed by a trusted source
		beneficiary = av_beneficiary.toLowerCase()

		try {
			const { data: assetResponse, status } = await api.verifyOwner(av_sip, beneficiary)
			assetData = assetResponse.asset
			verifyData = assetResponse
		} catch (error) {
			console.error(error)
			errorMsg = 'Error while trying to fetch API, maybe invalid av_sip?'
		}

		// ensure we only store lower-case

		if (verifyData) {
			wallet = verifyData.wallet

			// FIXME Some sort of verification if av_beneficiary has valid format.

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
	} else {
		errorMsg = "GET-Parameters av_sip or av_beneficiary missing!"
		noData = true
	}

	return {
		props: {
			nft,
			wallet,
			assetData,
			verifyData,
			noData,
			errorMsg,
			beneficiary: av_beneficiary,
			avSip: av_sip || null,
			session: JSON.parse(JSON.stringify(session)) // XXX: NextJS is dumb
		}
	}
}

const LandingNFT = ({ nft, noData, avSip, errorMsg, wallet, assetData, beneficiary, verifyData, props }) => {
	// Although nft is not used a.t.m, keep it, as we will use it later on
	// e.g. to dynamically upload Images to that NFT BEFORE claiming it.
	const [error, setError] = useState(errorMsg)
	const [newOwner, setNewOwner] = useState()
	const [ownershipStatus, setOwnershipStatus] = useState(
		verifyData.wallet_is_owner ? OWNER_STATUS : RECEIVING_STATUS
	)
	const [assetDataState, setAssetDataState] = useState(assetData);
	const [verifyDataState, setVerifyDataState] = useState(verifyData);
	const [walletState, setWalletState] = useState(wallet)


	const CurrentCard = useCallback(() => {
		switch (ownershipStatus) {
			// TODO add a status "Undefined NFT". In this case, there may be a view,
			// where the user can upload an image, as soon as uploaded, forward to RECEIVING_STATUS
			// and actually claim it
			case OWNER_STATUS:
				return (<OwnerCardView wallet={walletState} assetData={verifyDataState.asset} />)
			case RECEIVING_STATUS:
				return (<ReceivingCardView wallet={walletState} assetData={verifyDataState.asset} />)
			case LOST_STATUS:
				return (<LostCardView wallet={walletState} newOwner={newOwner} />)
			default:
				return (<ReceivingCardView wallet={walletState} assetData={verifyDataState.asset} />)
		}
	}, [ownershipStatus, nft, wallet, assetData, newOwner, verifyDataState])

	const nftWasClaimed = (result) => {
		if (result.wallet_is_owner) {
			return false
		} else {
			return true
		}
	}

	const nftWasTransfered = (result) => {
		if (!result.wallet_is_owner) {
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
				avAttestation:avSip,
				walletAddress: beneficiary
			})
		})

		const jResponse = await response.json()
		return jResponse
	}

	const claimNFT = async () => {
		const response = await fetch('/api/internal/landing/claim', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				avAttestation:avSip,
				beneficiary: beneficiary
			})
		})

		const data = response.json()

		if (response.ok) {
			const result = await poll(verifySipToken, nftWasClaimed, 3000)
			console.log(result)
			setAssetDataState(result); // Update the asset data state
			setWalletState(result.wallet);
			setVerifyDataState(result); // Owner will be updated... use it
			setOwnershipStatus(OWNER_STATUS)
		} else {
			setError('Something went wrong when trying to claim NFT')
		}
	}

	const checkNFTOwnership = async () => {
		const result = await poll(verifySipToken, nftWasTransfered, 3000)
		setAssetDataState(result); // Update the asset data state
		setNewOwner(result.asset.owner)
		setVerifyDataState(result); // Owner will be updated... use it
		setWalletState(result.wallet);
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
							<CurrentCard nft={nft} assetData={assetDataState} wallet={wallet} />
						</div>
					)}
				</main>
			</div>
		</Layout>
	)
}

export default LandingNFT
