import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import MetaAnchor from '@/lib/api.metaanchor.io'

const allowedMethods = ['POST']

const claimContract = async(api, csn, signedMessage) => {
	return await api.claimContract(csn, signedMessage)
}

const storeContracts = async(signedContracts, wallet) => {
	return await Promise.all(signedContracts.map(async(contract) => {
		return await prisma.contract.create({
			data: {
				csn: contract.csn,
				name: contract.contract_name,
				network: contract.network,
				address: contract.address,
				owner: {
					connect: {
						id: wallet.id
					}
				}
			}
		})
	}))
}

export default async function handle(req, res) {
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

	const wallet = await prisma.wallet.findUnique({
		where: {
			address
		}
	})

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
		//fetchNFTS()

		res.status(201).json({
			contracts, unclaimedContracts
		})
	} catch (e) {
		console.error(e)
		res.status(500).json({ error: "Can't connect to MetaAnchor API" })
	}
}
