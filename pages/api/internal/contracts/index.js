import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import MetaAnchor from '@/lib/api.metaanchor.io'
import { fetchAnchors, storeNFTS } from "../contract/[csn]/fetchNfts"

const allowedMethods = ['POST']

const claimContract = async(api, csn, signedMessage) => {
	return await api.claimContract(csn, signedMessage)
}

const storeContracts = async(signedContracts, wallet) => {
	return await Promise.all(signedContracts.map(async(contract) => {

		const created_contract= await prisma.contract.create({
			data: {
				csn: contract.csn,
				name: contract.contract_name || contract.name,
				network: contract.network,
				address: contract.address,
				owner: {
					connect: {
						id: wallet.id
					}
				},
				settings: {
					NFT_NAME: 'DigitalSoul [ANCHOR_SHORT]',
					NFT_DESCRIPTION: 'This is a MetaAnchor DigitalSoul-NFT from [COLLECTION_NAME].',
					// Do not claim NFTs, where the collection endpoint would return 404.
					CLAIM_UNDEFINED_NFT: false,
				}
			}
		})

		// create a default nft and assign to contract
		const default_nft = await prisma.NFT.create({
			data: {
				slid: "0",
				anchor: "default", // signal that this is no valid anchor
				metadata: undefined, // per default, do not set any metadata. Crucial for contract.default_nft logic to work
				defaultForContract: {
					connect: {
						id: created_contract.id
					}
				},
				contract: {
					connect: {
						id: created_contract.id
					}
				}
			}
		})

		return created_contract
	}))
}

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	let errorMsg

	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	const config = await prisma.config.findFirst()

	const api = new MetaAnchor({
		apiKey: config.apiKey,
		baseUrl: process.env.METAANCHOR_API_URL
	})

	const { signedContracts, wallet: address } = req.body

	if (!address || !signedContracts) {
		return res.status(400).json({ message: 'Missing required parameters' })
	}

	const wallet = await prisma.wallet.findUnique({
		where: {
			address: address?.toLowerCase()
		}
	})

	if (!wallet) {
		return res.status(404).json({ message: 'Wallet does not exists' })
	}

	// TODO: Deal with existing contracts that should be removed (most likely
	// they should be 'unclaimed' as well on MetaAnchor API?
	try {
		const contractResponse = await Promise.all(
			signedContracts.map(async(contract) => {
				return await claimContract(api, contract.csn, contract.signedMessage)
			})
		)

		const reclaimedContracts = contractResponse.filter((item) => item.sucess)
		const unclaimedContracts = contractResponse.filter((item) => !item.sucess)

		const contracts = await storeContracts(signedContracts, wallet)

		// TODO: Move this to a background job instead of doing it here!
		for (const contract of contracts) {
			// TODO replace this via API-Call to /api/internal/contract/[CSN]/fetchNfts
			// this is currently not possible due to the atomic commit structure and the endpoint fetching contracts via prisma
			const { data: anchors } = await fetchAnchors(api, contract.csn)

			if (anchors.length) {
				const nfts = await storeNFTS(anchors, contract)
			}
		}

		return res.status(201).json({
			contracts, unclaimedContracts
		})
	} catch (e) {
		console.error(e)
		return res.status(500).json({ error: "Can't connect to MetaAnchor API" })
	}
}
