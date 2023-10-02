import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const allowedMethods = ['GET']

export default async function handle(req, res) {
	// TODO: Move this somewhere else, probably as a utility function
	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	let contract
	let nft

	// TODO: Sanitize this
	const { csn, anchor } = req.query

	try {
		contract = await prisma.contract.findFirst({
			where: {
				csn: csn
			}
		})

		if (!contract) {
			res.status(404).json({ message: 'CSN does not exists on our records' })
		}
	} catch (e) {
		console.error(e.message)
		res.status(500).json({ message: 'An internal error happened' })
	}

	try {
		nft = await prisma.NFT.findFirst({
			where: {
				anchor: anchor,
				contract: {
					is: {
						id: contract.id
					}
				}
			}
		})

		if (!nft) {
			res.status(404).json({ message: 'NFT does not exists on our records' })
		}
	} catch (e) {
		console.error(e.message)
		res.status(500).json({ message: 'An internal error happened' })
	}

	// TODO: Generate external URL for the metadata using the
	// process.env.HOST_URL
	res.json(nft.metadata)
}
