import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

import prisma from '@/lib/prisma'

const allowedMethods = ['DELETE']

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	if (req.method == 'DELETE') {
		await deleteAssetFromNFT(req, res, session)
	}
}

const deleteAssetFromNFT = async (req, res, session) => {
	const { anchor } = req.query
	const { assetHash } = req.body

	if (!anchor) {
		return res.status(400).json({ message: 'Missing required parameters' })
	}

	let nft = await prisma.NFT.findFirst({
		where: {
			anchor: anchor,
			contract: {
				ownerId: session.wallet.id
			}
		},
		include: {
			contract: true,
			assets: {
				orderBy: {
					updatedAt: 'desc'
				}
			}
		}
	})

	if (!nft) {
		return res.status(404).json({ message: 'NFT does not exist' })
	}

	const assetId = nft.assets
		.find((asset) => asset.assetHash == assetHash)?.id

	await prisma.NFT.update({
		where: {
			id: nft.id
		},
		data: {
			assets: {
				disconnect: { id: assetId }
			}
		}
	})

	return res.json({ ...nft })
}
