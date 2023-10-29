import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

import prisma from '@/lib/prisma'

const allowedMethods = ['GET']

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	let errorMsg

	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	const { contractId } = req.query

	console.log(req.query)

	if (!contractId) {
		return res.status(400).json({ message: 'Missing required parameters' })
	}

	// TODO: Deal with unexisting contracts
	const nfts = await prisma.NFT.findMany({
		where: {
			contractId
		}
	})

	return res.json({ nfts })
}