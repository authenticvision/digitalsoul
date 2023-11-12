import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/lib/prisma'

const allowedMethods = ['PUT']

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	const { csn } = req.query
	const { contractSettings: rawContractSettings } = req.body
	let contractSettings = rawContractSettings

	if (typeof rawContractSettings == "string") {
		try {
			metadata = JSON.parse(rawContractSettings)
		} catch (error) {
			console.error(error)
			return res.status(422).json({
				message: 'JSON is either malformatted or not a JSON object'
			})
		}
	}

	const contract = await prisma.Contract.findFirst({
		where: {
			csn: csn,
            owner: session.wallet_id	
		}
	})

	if (!contract) {
		return res.status(404).json({ message: 'Contract does not exist' })
	}

	try {
		const updatedSettings = await prisma.Contract.update({
			where: {
				id: contract.id
			},
			data: {
				settings: contractSettings,
				updatedAt: new Date()
			}
		})

		contract.settings = contractSettings
	} catch (err) {
		console.error(err)
		return res.status(500).json({
			message: 'There were some error when updating the contract settings',
		})
	}
	return res.json({ ...contract })
}
