import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

import prisma from '@/lib/prisma'
import { z } from 'zod'
import { fromZodError, isValidationErrorLike } from 'zod-validation-error';

const allowedMethods = ['PUT']
const metadataSchema = z.object({
	name: z.string().optional(),
	description: z.string().optional(),
	external_url: z.string().optional(),
	attributes: z.array(
		z.object({
			trait_type: z.string(),
			value: z.string(),
			display_type: z.string().optional(),
			max_value: z.number().optional(),
			min_value: z.number().optional()
		})
	).optional().default([])
}).passthrough()

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
	const { metadata } = JSON.parse(req.body || {})

	const nft = await prisma.NFT.findFirst({
		where: {
			anchor: anchor,
			contract: {
				ownerId: session.wallet.id,
				csn: {
					equals: csn,
					mode: "insensitive"
				}
			}
		}
	})

	if (!nft) {
		return res.status(404).json({ message: 'NFT does not exist' })
	}

	try {
		const result = metadataSchema.parse(metadata)
	} catch (err) {
		const validationErrors = fromZodError(err);
		console.error("ZodError: ", validationErrors);

		return res.status(422).json({
			message: 'There was some error when validating the metadata',
			issues: validationErrors.toString()
		})
	}

	try {
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
	} catch (err) {
		console.error(err)
		return res.status(500).json({
			message: 'There were some error when updating the metadata',
		})
	}


	return res.json({ ...nft })
}
