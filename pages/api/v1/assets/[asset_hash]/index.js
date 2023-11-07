import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import fs from 'fs';
import path from 'path';
import {fileTypeFromBuffer} from 'file-type';

const allowedMethods = ['GET']

export default async function handle(req, res) {
	// TODO: Move this somewhere else, probably as a utility function
	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	// TODO: Sanitize this
	const { asset_hash } = req.query

	try {
		const asset = await prisma.asset.findFirst({
			where: {
				assetHash: asset_hash
			}
		})

		if (!asset) {
			return res.status(404).json({ message: 'Asset does not exist on our records' })
		}

		const STORAGE_DIR = process.env.STORAGE_DIR
		const filePath = path.join(STORAGE_DIR, asset.fileName)

		// Read the file content
		const fileContent = fs.readFileSync(filePath);

		// Determine the file type
		const ft = await fileTypeFromBuffer(fileContent);

		// Set the headers
		res.setHeader('Content-Type', asset.assetType);
		res.setHeader('Content-Type', ft.mime);
		res.setHeader('Content-Length', fileContent.length);

	  
		// Send the binary content
		res.end(fileContent);
	} catch (e) {
		console.error(e.message)
		return res.status(500).json({ message: 'An internal error happened' })		
	}
}
