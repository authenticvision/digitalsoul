import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const allowedMethods = ['POST']

export default async function handle(req, res) {
	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	const { address } = req.body
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

		res.status(422).json({ error: errorMsg })
	}

	res.status(201).json({ wallet: walletResult })
}
