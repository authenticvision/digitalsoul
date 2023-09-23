import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const allowedMethods = ['POST']

const registerInstance = async({ wallet, config }) => {
	const registrationURL = `${process.env.METAANCHOR_API_URL}/register`

	const data = {
		registrar: wallet.address,
		instance_api_data: config.instanceApiKey,
		authorization: config.signedMessage,
		uri: process.env.HOST_URL,
		version: 'v0.0.0' // TODO: Grab this from env?
	}

	try {
		const response = await fetch(registrationURL, {
			method: "POST", // or 'PUT'
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})

		const responseData = await response.json()
	} catch (error) {
		// TODO: Setup some error collection service, otherwise log to somewhere
		console.log("Error while attempting to communicate with API", error)
		throw error
	}
}

// TODO: Add data validation via Zod, validate incoming body object while we're
// at it
export default async function handle(req, res) {
	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	const { signedMessage, address } = req.body
	const instanceApiKey = crypto.randomBytes(32).toString("hex")
	let errorMsg
	let walletResult

	try {
		walletResult = await prisma.wallet.create({
			data: {
				address
			}
		})
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError) {
			// This is the code for a unique constraint violation
			if (e.code === 'P2002') {
				errorMsg = 'There is a uncomplete instance setup going on. This wallet already exists!'

				console.log(
					errorMsg
				)
			}
		}

		res.status(500).json({ error: errorMsg })
	}

	// XXX: Bit redundant info here, might be better to associate to the wallet
	// entity? For simplicity we can assume that's the first wallet as well
	const configResult = await prisma.config.create({
		data: {
			instanceApiKey,
			signedMessage,
			address
		}
	})

	try {
		//const apiData = await registerInstance({
		//	wallet: walletResult,
		//	config: configResult
		//})

		// TODO: Replace with actual data from API. Most likely from a fake one
		const updatedConfig = await prisma.config.update({
			where: { id: configResult.id },
			data: { apiKey: "abcdef12345" },
		})
	} catch (apiError) {
		res.status(500).json({ error: "Something went wrong on storing API key" })
	}

	res.status(201).json({ wallet: walletResult, config: configResult })
}
