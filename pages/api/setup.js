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

const createWalletAndConfig = async({ address, instanceApiKey, signedMessage }) => {
	try {
		return await prisma.$transaction(async(tx) => {
			let wallet = await prisma.wallet.upsert({
				where: {
					address
				},
				update: {},
				create: {
					address
				}
			})

			let config = await prisma.config.create({
				data: {
					instanceApiKey,
					signedMessage,
					address
				}
			})

			return { wallet, config }
		})
	} catch (e) {
		// TODO: Add this to a unified error service
		console.error(e)
		errorMsg = "There was an error when trying to record the data"

		return { error: errorMsg }
	}
}

export default async function handle(req, res) {
	// TODO: Move this somewhere else, probably as a utility function
	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	const { signedMessage, address } = req.body
	const instanceApiKey = crypto.randomBytes(32).toString('hex')

	const { wallet, config, error } = await createWalletAndConfig({
		instanceApiKey,
		signedMessage,
		address
	})

	if (error) {
		res.status(500).json({ error: errorMsg })
	}

	try {
		// TODO: Replace this with a call to metaanchor API register endpoint
		const updatedConfig = await prisma.config.update({
			where: { id: config.id },
			data: { apiKey: process.env.METAANCHOR_API_TOKEN },
		})
	} catch (e) {
		// TODO: Add this to a unified error service
		console.error(e)
		let errorMsg = "There was an error when trying to record the data"
		res.status(500).json({ error: errorMsg })
	}

	res.status(201).json({ wallet: wallet, config: config })
}
