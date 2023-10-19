import React, { useState } from 'react'
import { useRouter } from 'next/router'
import NextHead from 'next/head.js'
//import paseto, { V4 as passetoquatro } from 'paseto'

import { useSession } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import prisma from "@/lib/prisma"
import MetaAnchor from '@/lib/api.metaanchor.io'
import { auth } from "auth"

import { Layout, Alert, Button } from '@/components/ui'
import { NFTCard } from '@/components/landing'

export async function getServerSideProps(context) {
	// TODO: Move most of this stuff into it's own module
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

		wallet = await prisma.wallet.findUnique({
			where: {
				address: av_beneficiary
			},
			select: {
				address: true,
			}
		})

		if (!wallet) {
			errorMsg = 'This wallet does not exist on our records!'
		} else {
			// XXX: This endpoint is broken for the test sip token
			try {
				const { data: assetResponse, status } = await api.getAssetBySip(av_sip)

				console.log("Asset Response: ", assetResponse, status)
			} catch (error) {
				console.error(error)
				// XXX: Ignore until the API is fixed
				// errorMsg = 'Error while trying to fetch API'
			}

			// XXX: Where do we extract this public key?
			//const publicKey = 'k4.public.f2AxH__c3AQy_abwIYAZvwzLYrLPAUNH5o6cFzPj1_0'
			//const payload = await paseto.V4.verify(av_sip, publicKey)
			//console.log(payload, data)

			assetData = {
				"token_uri": "http://localhost:3000/api/v1/collection/0xaacb9848a60cc6af9da43fe5a57bfab90b910b2dbe9ff87243f43898147a5dd4",
				"owner": "0x3B7e66cef9ae94247793Afa638C9828Fb2A83C54",
				"token_id": "52",
				"anchor": "0x9e0a245aa649eaf595872c7d221241365ccdc2c198cc1e3801b5c8de0d819f36"
			}

			// TODO: Sanitize and validate the assetData.anchor is a valid
			// anchor, raw queries are sanitized by default
			const nftResults = await prisma.$queryRaw`
				SELECT slid, anchor, contracts.address AS contract_address,
				contracts.name AS contract_name, contracts.csn AS contract_csn
				FROM nfts
				INNER JOIN contracts ON contracts.id = nfts.contract_id
				INNER JOIN wallets ON wallets.id = contracts.owner_id
				WHERE wallets.address = ${wallet.address}
				AND nfts.anchor = ${assetData.anchor} LIMIT 1
			`;

			if (nftResults.length == 1) {
				nft = nftResults[0]
			} else {
				errorMsg = 'There are two nfts locally, database is broken'
			}
		}
	} else {
		noData = true
	}

	console.log(nft);

	return {
		props: {
			nft,
			wallet,
			assetData,
			noData,
			errorMsg,
			session: JSON.parse(JSON.stringify(session)) // XXX: NextJS is dumb
		}
	}
}

const LandingNFT = (props) => {
	const [error, setError] = useState(props.errorMsg)
	const [nft, setNFT] = useState(props.nft)
	const [assetData, setAssetData] = useState(props.assetData)

	return (
		<Layout>
			<NextHead>
				<title>Welcome to MetaAnchor - Landing</title>
			</NextHead>

			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col">
					<div className="flex justify-center py-2">
						{error && (
							<Alert type='error' text={error} />
						)}
					</div>

					<div className="flex justify-center py-2">
						<NFTCard assetData={assetData} nft={nft} wallet={props.wallet} />
					</div>
				</main>
			</div>
		</Layout>
	)
}

export default LandingNFT
