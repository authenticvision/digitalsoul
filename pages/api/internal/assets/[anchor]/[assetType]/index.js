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

const computeFileHash = (csn, file) => {
	const hashedFile = keccak256(file)

	return id(`${csn}:${hashedFile}`)
}

const connectWithExistingAsset = async (asset, nft) => {
	await prisma.NFT.update({
		where: {
			id: nft.id
		},
		data: {
			updatedAt: new Date(),
			assets: {
				connect: [{
					id: asset.id
				}]
			}
		}
	})
}

const createAsset = async ({ nft, fileHash, storageFilePath, assetType, originalFileName, contractId }) => {
	await prisma.asset.create({
		data: {
			filePath: storageFilePath,
			assetHash: fileHash,
			assetType: assetType,
			originalFileName,
			contract: {
				connect: {
					id: contractId
				}
			},
			nfts: {
				connect: [{
					id: nft.id
				}]
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

	const { anchor, assetType } = req.query

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
			await connectWithExistingAsset(existingAsset, nft)
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

				const asset = await createAsset({
					nft,
					fileHash,
					storageFilePath,
					assetType,
					contractId: nft.contract.id,
					originalFileName: uploadedFile.name
				})

				return res.json({
					asset
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
