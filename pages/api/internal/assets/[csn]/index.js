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

	const { csn } = req.query

	if (!csn) {
		return res.status(400).json({ message: 'Missing required parameters' })
	}

	// TODO: Deal with unexisting contracts
	// TODO: Add pagination

	const contract = await prisma.contract.findFirst({
		where: {
			csn
		}
	})

	const assets = await prisma.asset.findMany({
		where: {
			contractId: contract.id
		},
		orderBy: {
			updatedAt: 'desc'
		}
	})

	return res.json({ assets })
}
