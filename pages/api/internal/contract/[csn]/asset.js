import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

import path from 'path'
import mime from 'mime'
import { tmpdir } from "os"
import { renameSync, mkdirSync, rmSync, createReadStream } from 'fs';

import prisma from '@/lib/prisma'

import formidable from 'formidable-serverless'
import { computeKeccak256Hash, computeCsnFileHash } from '@/lib/utils'

const allowedMethods = ['POST']

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

export const config = {
  api: {
    bodyParser: false,
  }
}

const STORAGE_DIR = process.env.STORAGE_DIR

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	// TODO: Move this somewhere else, probably as a utility function
	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	const { csn } = req.query
	const { wallet } = session

	// TODO: Add validation from owner
	const contract = await prisma.contract.findFirst({
		where: {
			csn
		}
	})

	const form = new formidable.IncomingForm()
	const tmpDir = path.join(process.env.STORAGE_DIR, "upload")
	form.uploadDir = tmpDir

	form.parse(req, async (err, fields, files) => {
		const uploadedFile = files.assets

		if (!allowedMimeTypes.includes(uploadedFile.type)) {
			rmSync(uploadedFile.path)
			return res.status(422).json({
				message: `File type ${uploadedFile.type} is not allowed`
			})
		}

		const fileStream = createReadStream(uploadedFile.path)
		const hashedFile = await computeKeccak256Hash(fileStream)
		const fileCsnHash = computeCsnFileHash(contract.csn, hashedFile)

		try {
			// Split files per Smart contract. This is a logical separation and
			// also reduces the risk of Filesystem-overload due to too many
			// files in the same directory
			const targetDir = path.join(STORAGE_DIR, contract.csn)
			const storageFilePath = path.join(contract.csn, fileCsnHash)
			const targetFile = path.join(targetDir, fileCsnHash)

			// Create contract-directory in case it does not exist
			mkdirSync(targetDir, { recursive: true })
			renameSync(uploadedFile.path, targetFile)

			const asset = await prisma.asset.create({
				data: {
					assetHash: fileCsnHash,
					filePath: storageFilePath,
					originalFileName: uploadedFile.name,
					contract: {
						connect: {
							id: contract.id
						}
					}
				}
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
	})
}
