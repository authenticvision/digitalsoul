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
			return res.status(404).json({ message: 'CSN does not exists on our records' })
			
		}
	} catch (e) {
		console.error(e.message)
		return res.status(500).json({ message: 'An internal error happened' })		
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
			},
			include: {
				contract: {
					include: {
						defaultNft: true
					}
				}
			}
		})

		if (!nft) {
			return res.status(404).json({ message: 'NFT does not exists on our records' })
		}

		if (nft.slid == "0") {
			return res.status(404).json({message: 'NFT does not exist on our records'})
		}

		let toReturn = nft.metadata

		// Default-NFT logic
		if ( !toReturn) {
			// If metadata is not set on a NFT base, check whether there is a default NFT
			toReturn = nft.contract?.defaultNft.metadata

			if (!toReturn) {
				return res.status(404).json({"message": "No metadata found"})
			}
			return res.json(toReturn)
		}

	} catch (e) {
		console.error(e.message)
		res.status(500).json({ message: 'An internal error happened' })
		return
	}
}
