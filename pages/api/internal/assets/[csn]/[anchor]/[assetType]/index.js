import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

import path from 'path'
import mime from 'mime'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

import formidable from 'formidable-serverless'
import { readFileSync, renameSync, mkdirSync, existsSync, rmSync } from 'fs';
import { keccak256, id } from 'ethers'
import { tmpdir } from "os"

const allowedMethods = ['POST']

const allowedMimeTypes = [
	mime.getType('jpg'),
	mime.getType('gif'),
	mime.getType('png'),
	//mime.getType('webp'), // Stop support for webp, see https://github.com/authenticvision/digitalsoul/issues/43
	//mime.getType('m4a'),
	//mime.getType('mp4'),
	//mime.getType('mkv'),
	//mime.getType('avi'),
	// mime.getType('webm'), // Stop support for webm, see https://github.com/authenticvision/digitalsoul/issues/43
	//mime.getType('mov'),
	//mime.getType('wmv')
]

export const config = {
  api: {
    bodyParser: false,
  }
}

const STORAGE_DIR = process.env.STORAGE_DIR

const softDeleteAssetsFromNFT = async (nft, assetType) => {
	const ids = nft.assets
		.filter((nftAsset) => nftAsset.assetType == assetType)
		.map(async(nftAsset) => {
			return await prisma.assetNFT.update({
				where: {
					assetId_nftId: {
						nftId: nft.id,
						assetId: nftAsset.assetId
					}
				},
				data: {
					active: false,
					updatedAt: new Date()
				}
			})
		})
}

const computeFileHash = (csn, file) => {
	const hashedFile = keccak256(file)

	return id(`${csn}:${hashedFile}`)
}

const connectWithExistingAsset = async (wallet, asset, assetType, nft) => {
	await prisma.assetNFT.create({
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
					id: asset.id
				}
			}
		},
		include: {
			asset: true
		}
	})
}

const createAsset = async ({ wallet, nft, assetCtx, contractId }) => {
	const { fileHash, storageFilePath, assetType, originalFileName } = assetCtx

	return await prisma.assetNFT.create({
		data: {
			assetType: assetType,
			active: true,
			assignedAt: new Date(),
			assignedBy: {
				connect: {
					id: wallet.id
				}
			},
			asset: {
				create: {
					filePath: storageFilePath,
					assetHash: fileHash,
					originalFileName,
					contract: {
						connect: {
							id: contractId
						}
					}
				}
			},
			nft: {
				connect: {
					id: nft.id
				}
			}
		},
		include: {
			asset: true
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

	const { csn, anchor, assetType } = req.query
	const wallet = session.wallet

	const nft = await prisma.NFT.findFirst({
		where: {
			anchor,
			contract: {
				csn: {
					equals: csn,
					mode: "insensitive"
				}
			}
		},
		include: {
			contract: true,
			assets: true
		}
	})

	// TODO: Migrate this into a service
	await softDeleteAssetsFromNFT(nft, assetType)

	const form = new formidable.IncomingForm()
	const tmpDir = path.join(process.env.STORAGE_DIR, "upload")
	form.uploadDir = tmpDir

	form.parse(req, async (err, fields, files) => {
		const uploadedFile = files.assets

		if (!allowedMimeTypes.includes(uploadedFile.type)) {
			rmSync(uploadedFile.path)
			return res.status(422).json({ message: 'File type ${uploadedFile.type} is not allowed' })
		}

		const fileContent = readFileSync(uploadedFile.path)
		const fileHash = computeFileHash(nft.contract.csn, fileContent)

		const existingAsset = await prisma.asset.findFirst({
			where: {
				assetHash: fileHash
			}
		})

		if (existingAsset) {
			await connectWithExistingAsset(wallet, existingAsset, assetType, nft)
			rmSync(uploadedFile.path)
			return res.json({
				existingAsset
			})
		} else {
			try {
				// Split files per Smart contract.
				// This is a logical separation and also reduces the risk of Filesystem-overload
				// due to too many files in the same directory
				const targetDir = path.join(STORAGE_DIR, nft.contract.csn)
				const storageFilePath = path.join(nft.contract.csn, fileHash)
				const targetFile = path.join(targetDir, fileHash)

				// Create contract-directory in case it does not exist
				mkdirSync(targetDir, {recursive:true})
				renameSync(uploadedFile.path, targetFile)

				const assetNFT = await createAsset({
					wallet,
					nft,
					assetCtx: {
						fileHash,
						storageFilePath,
						originalFileName: uploadedFile.name,
						assetType
					},
					contractId: nft.contract.id,
				})

				return res.json({
					asset: assetNFT.asset
				})
			} catch (error) {
				console.error(error)
				rmSync(uploadedFile.path)
				return res.status(500).json({
					error: 'There was an error when storing the asset'
				})
			}
		}
	})
}
