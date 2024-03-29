import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { checkAllowedMethods } from '@/lib/apiHelpers';
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const allowedMethods = ['POST']

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	if (!await checkAllowedMethods(req, res, allowedMethods)) return;


	let { address } = req.body
	address = address?.toLowerCase()

	let errorMsg
	let walletResult

	try {
		walletResult = await prisma.wallet.upsert({
			where: {
				address
			},
			create: {
				address
			},
			update: {},
		})
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError) {
			// This is the code for a unique constraint violation
			if (e.code === 'P2002') {
				errorMsg = 'This wallet already exists!'

				console.log(
					errorMsg
				)
			}
		}

		return res.status(422).json({ error: errorMsg })
	}

	return res.status(201).json({ wallet: walletResult })
}
