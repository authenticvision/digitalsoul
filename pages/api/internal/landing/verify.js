import prisma from '@/lib/prisma'
import MetaAnchor from '@/lib/api.metaanchor.io'
import { checkAllowedMethods } from '@/lib/apiHelpers';


const allowedMethods = ['POST']

export default async function handle(req, res) {
	// TODO: Move this somewhere else, probably as a utility function
	if (!await checkAllowedMethods(req, res, allowedMethods)) return;

	const { avAttestation, walletAddress } = req.body

	// In case the wallet is null, pass an empty string to the API, as this is
	// better understood than null
	const walletID = walletAddress || "";

	if (!avAttestation) {
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

	try {
		const { data: response, status } = await api.verifyOwner(
			avAttestation, 
			walletID
		)

		// TODO: Maybe add some validation of the status code?
		return res.json(response)
	} catch (e) {
		// TODO: Add this to a unified error service
		console.error(e)
		let errorMsg = `There was an error when trying to communicate with
		the /asset-by-attestation endpoint`

		return res.status(500).json({ error: errorMsg })
	}
}
