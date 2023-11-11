import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

import prisma from '@/lib/prisma'
import { z } from 'zod'

const allowedMethods = ['PUT']
const metadataSchema = z.object({
	name: z.string(),
	description: z.string(),
	external_url: z.string().optional(),
	attributes: z.array(
		z.object({
			trait_type: z.string(),
			value: z.string(),
			display_type: z.string().optional(),
			max_value: z.number().optional(),
			min_value: z.number().optional()
		})
	)
})

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	let errorMsg

	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	const { anchor } = req.query
	const { metadata: rawMetadata } = req.body
	let metadata = rawMetadata

	if (typeof rawMetadata == "string") {
		try {
			metadata = JSON.parse(rawMetadata)
		} catch (error) {
			console.error(error)
			return res.status(422).json({
				message: 'JSON is either malformatted or not a JSON object'
			})
		}
	}

	const nft = await prisma.NFT.findFirst({
		where: {
			anchor: anchor,
			contract: {
				ownerId: session.wallet.id
			}
		}
	})

	if (!nft) {
		return res.status(404).json({ message: 'NFT does not exist' })
	}

	const result = metadataSchema.safeParse(metadata)

	if (!result.success) {
		const issues = result.error.format()

		return res.status(422).json({
			message: 'Data is malshaped',
			issues
		})
	}

	const updatedMetadata = await prisma.NFT.update({
		where: {
			id: nft.id
		},
		data: {
			metadata: metadata,
			updatedAt: new Date()
		}
	})

	nft.metadata = metadata

	return res.json({ ...nft })
}
