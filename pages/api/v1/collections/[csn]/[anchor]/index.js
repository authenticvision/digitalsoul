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
				assets: {
					include: {}
				},
				contract: {
					include: {
						defaultNft: {
							include: {
								assets: {}
							}
						}
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

		let nftToReturn = undefined

		if (nft.metadata || nft.assets.length>0) {
			nftToReturn = nft
		} else {
			if (nft.contract?.defaultNft.metadata || nft.contract?.defaultNft.assets.length>0) {
				nftToReturn = nft.contract.defaultNft
			}
		}

		if (!nftToReturn) {
			return res.status(404).json({"message": "No metadata found"})
		}

		let metadata = nftToReturn.metadata
		if (!metadata) {
			// then there were assets, so create an empty object
			metadata = {}
		}

		// Filling the assets
		// Note this overwrites any pre-existing keys
		nftToReturn.assets.map((a, index) => (
			metadata[a.assetType] =  new URL("/api/v1/assets/" + a.assetHash, process.env.NEXTAUTH_URL).toString()
		))
		
		return res.json(metadata)


	} catch (e) {
		console.error(e.message)
		res.status(500).json({ message: 'An internal error happened' })
		return
	}
}
