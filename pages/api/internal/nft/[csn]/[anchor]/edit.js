import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error';
import { checkAllowedMethods } from '@/lib/apiHelpers';

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
})

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	if (!await checkAllowedMethods(req, res, allowedMethods)) return;

	const { anchor, csn } = req.query
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
			message: '',
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
