import prisma from '@/lib/prisma'
import MetaAnchor from '@/lib/api.metaanchor.io'
import { checkAllowedMethods } from '@/lib/apiHelpers';

const allowedMethods = ['POST']

export default async function handle(req, res) {
	// TODO: Move this somewhere else, probably as a utility function
	if (!await checkAllowedMethods(req, res, allowedMethods)) return;

	const { avSip, address } = req.body

	if (!avSip || !address) {
		return res.status(400).json({ message: 'Missing required parameters' })
	}

	const config = await prisma.config.findFirst()
	const api = new MetaAnchor({
		apiKey: config.apiKey,
		baseUrl: process.env.METAANCHOR_API_URL
	})

	if (!config) {
		console.error('This instance is not properly setup yet!')

		return res.status(422).json({
			message: 'This instance is not properly setup.'
		})
	}

	const wallet = await prisma.wallet.findUnique({
		where: {
			address: address?.toLowerCase()
		}
	})

	if (!wallet) {
		let errorMsg = 'The wallet address was not found.'
		console.error(errorMsg)

		return res.status(422).json({
			message: errorMsg
		})
	}

	try {
		const { data: response, status } = await api.claimNFT(
			avSip, wallet.address?.toLowerCase()
		)

		if (status == 200) {
			return res.json(response)
		} else {
			let errorMsg = `Either the token was expired or instance does not
			hold the contract used`
			console.error(errorMsg)

			return res.status(422).json({
				message: errorMsg
			})
		}
	} catch (e) {
		// TODO: Add this to a unified error service
		console.error(e)
		let errorMsg = `There was an error when trying to communicate with
		the /drop endpoint`

		return res.status(500).json({ error: errorMsg })
	}
}
