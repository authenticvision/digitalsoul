import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

import prisma from '@/lib/prisma'
import { z } from 'zod'
import mime from 'mime'
import { fromZodError } from 'zod-validation-error';
import formidable from 'formidable';
import path from 'path'
import { renameSync, mkdirSync, rmSync, createReadStream } from 'fs';
import { computeKeccak256Hash, computeCsnFileHash } from '@/lib/utils'

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

export const config = {
	api: {
		bodyParser: false,
	}
}

const STORAGE_DIR = process.env.STORAGE_DIR

const allowedMimeTypes = [
	mime.getType('jpg'),
	mime.getType('gif'),
	mime.getType('png'),
	//mime.getType('webp'), // Stop support for webp, see https://github.com/authenticvision/digitalsoul/issues/43
	//mime.getType('m4a'),
	mime.getType('mp4'),
	//mime.getType('mkv'),
	//mime.getType('avi'),
	// mime.getType('webm'), // Stop support for webm, see https://github.com/authenticvision/digitalsoul/issues/43
	mime.getType('mov'),
	//mime.getType('wmv')
]

const softDeleteAssetsFromNFT = async (nft, assetType) => {
	const ids = nft.assets
		.filter((nftAsset) => nftAsset.assetType == assetType && nftAsset.active == true)
		.map(async(nftAsset) => {
			return await prisma.assetNFT.update({
				where: {
					id: nftAsset.id
				},
				data: {
					active: false,
					updatedAt: new Date()
				}
			})
		})
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

	const { anchor, csn } = req.query

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
		},
		include: {
			assets: true
		}
	})

	const contract = await prisma.Contract.findFirst({
		where: {
			ownerId: session.wallet.id,
			csn: {
				equals: csn,
				mode: "insensitive"
			}
		}
	})

	if (!nft) {
		return res.status(404).json({ message: 'NFT does not exist' })
	}

	console.log('nft exists, entering the form parsin')

	const form = formidable({})
	const tmpDir = path.join(process.env.STORAGE_DIR, "upload")
	form.uploadDir = tmpDir

	let fields, files

	try {
		[fields, files] = await form.parse(req)
	} catch (err) {
		console.error(err)

		return res.status(500)
			.json({ message: 'There was some error when parsing the form' })
	}

	const metadata = JSON.parse(fields.metadata || {})

	// XXX: We always upload the file, we could add a check to see if the
	// computed hash matches an existing asset and skip the upload
	if (files.image) {
		const uploadedFile = files.image[0]

		if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
			rmSync(uploadedFile.filepath)
			return res.status(422).json({
				message: `File type ${uploadedFile.mimetype} is not allowed`
			})
		}

		const fileStream = createReadStream(uploadedFile.filepath)
		const hashedFile = await computeKeccak256Hash(fileStream)
		const fileCsnHash = computeCsnFileHash(contract.csn, hashedFile)

		try {
			// Split files per Smart contract. This is a logical separation and
			// also reduces the risk of Filesystem-overload due to too many
			// files in the same directory
			const targetDir = path.join(STORAGE_DIR, contract.csn)
			const storageFilePath = path.join(contract.csn, fileCsnHash)
			const targetFile = path.join(targetDir, fileCsnHash)
			const originalFileName = uploadedFile.originalFilename

			// Create contract-directory in case it does not exist
			mkdirSync(targetDir, { recursive: true })
			renameSync(uploadedFile.filepath, targetFile)

			const asset = await prisma.asset.create({
				data: {
					assetHash: fileCsnHash,
					filePath: storageFilePath,
					originalFileName: originalFileName,
					contract: {
						connect: {
							id: contract.id
						}
					}
				}
			})

			// TODO: Move this crap into a service
			await softDeleteAssetsFromNFT(nft, 'image')

			await prisma.AssetNFT.create({
				data: {
					assetType: 'image',
					active: true,
					asset: {
						connect: {
							id: asset.id
						}
					},
					assignedBy: {
						connect: {
							id: session.wallet.id
						}
					},
					nft: {
						connect: {
							id: nft.id
						}
					}
				}
			})
		} catch (error) {
			console.error(error)
			rmSync(uploadedFile.filepath)
			return res.status(500).json({
				error: 'There was an error when storing the image'
			})
		}
	}

	if (metadata) {
		try {
			metadataSchema.parse(metadata)
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
	}

	return res.json({ ...nft })
}
