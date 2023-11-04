import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import formidable from 'formidable-serverless'

const allowedMethods = ['POST']

export const config = {
  api: {
    bodyParser: false,
  }
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
	const form = new formidable.IncomingForm()
	form.parse(req, async (err, fields, files) => {
		console.log(err, fields, files.assets)

		return res.status(202).json({})
	});
}
