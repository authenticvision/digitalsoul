import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

import prisma from '@/lib/prisma'

const allowedMethods = ['POST']

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	let errorMsg

	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	const { anchor, csn } = req.query

	if (!csn || !anchor) {
		return res.status(400).json({ message: 'Missing required parameters' })
	}

	const wallet = session.wallet

	const contract = await prisma.contract.findFirst({
		where: {
			csn
		}
	})

	const nft = await prisma.NFT.findFirst({
		where: {
			anchor
		}
	})

	const { assetType, assetId } = req.body

	if (!assetType || !assetId) {
		return res.status(422).json({ message: 'Missing required parameters' })
	}

	// TODO: What to do when there's a asset linked to a NFT with the same
	// type?
	const existingAssetNFT = await prisma.assetNFT.findFirst({
		where: {
			assetType,
			nft: {
				anchor
			}
		}
	})

	if (existingAssetNFT) {
		return res.status(409).json({
			message: 'There is an Asset linked to NFT with that name'
		})
	}

	const assetNFT = await prisma.assetNFT.create({
		data: {
			active: true,
			assetType,
			assignedAt: new Date(),
			assignedBy: {
				connect: {
					id: wallet.id
				}
			},
			nft: {
				connect: {
					id: nft.id
				}
			},
			asset: {
				connect: {
					id: assetId
				}
			}
		},
		include: {
			asset: true
		}
	})

	return res.json({ assetNFT })
}
