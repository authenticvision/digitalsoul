import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

import path from 'path'
import mime from 'mime'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

import formidable from 'formidable-serverless'
import { readFileSync, writeFileSync } from 'fs';
import { keccak256, id } from 'ethers'

const allowedMethods = ['POST']

const allowedMimeTypes = [
	mime.getType('jpg'),
	mime.getType('gif'),
	mime.getType('png'),
	mime.getType('m4a'),
	mime.getType('mp4'),
	mime.getType('mkv'),
	mime.getType('avi'),
	mime.getType('webm'),
	mime.getType('webp'),
	mime.getType('mov'),
	mime.getType('wmv')
]

export const config = {
  api: {
    bodyParser: false,
  }
}

const STORAGE_DIR = process.env.STORAGE_DIR

const dropAssetsFromNFT = async (nft) => {
	await prisma.NFT.update({
		where: {
			id: nft.id
		},
		data: {
			assets: {
				set: []
			}
		}
	})
}

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	// TODO: Move this somewhere else, probably as a utility function
	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	const { anchor } = req.query

	const nft = await prisma.NFT.findFirst({
		where: {
			anchor
		},
		include: {
			contract: true,
			assets: true
		}
	})

	// TODO: What to do with assets that aren't attached to any other NFT?
	// Should this clean up run on an async job?
	await dropAssetsFromNFT(nft)

	const form = new formidable.IncomingForm()
	form.parse(req, async (err, fields, files) => {
		const uploadedFile = files.assets

		if (!allowedMimeTypes.includes(uploadedFile.type)) {
			return res.status(422).json({ message: 'File type is not allowed' })
		}

		const filePath = uploadedFile.path
		const fileContent = readFileSync(filePath)

		const hashedFile = keccak256(fileContent)
		const finalHash = id(`${nft.contract.csn}:${hashedFile}`)

		const existingAsset = await prisma.asset.findFirst({
			where: {
				assetHash: finalHash
			}
		})

		if (existingAsset) {
			await prisma.NFT.update({
				where: {
					id: nft.id
				},
				data: {
					updatedAt: new Date(),
					assets: {
						connect: [{
							id: existingAsset.id
						}]
					}
				}
			})

			return res.json({
				existingAsset
			})
		} else {
			try {
				writeFileSync(path.join(STORAGE_DIR, finalHash), fileContent)

				const asset = await prisma.asset.create({
					data: {
						fileName: finalHash,
						assetHash: finalHash,
						assetType: 'image',
						originalFileName: uploadedFile.name,
						contract: {
							connect: {
								id: nft.contract.id
							}
						},
						nfts: {
							connect: [{
								id: nft.id
							}]
						}
					}
				})

				return res.json({
					asset
				})
			} catch (error) {
				console.error(error)

				return res.status(500).json({
					error: 'There was an error when storing the asset'
				})
			}
		}
	})
}
