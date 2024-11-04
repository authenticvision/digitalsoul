import prisma from '@/lib/prisma'
import { formatAddress, fillVariablesIntoString, fixedLengthHexString, nftDefined } from '@/lib/utils'
import { makePublicEndpoint } from '@/lib/apiHelpers';

const allowedMethods = ['GET']



export default async function handle(req, res) {
	if (!await makePublicEndpoint(req, res, allowedMethods)) return;

	let contract

	// TODO: Sanitize this
	const { csn } = req.query
	try {
		contract = await prisma.contract.findFirst({
			where: {
				csn: csn
			}
		})

		if (!contract) {
			return res.status(404).json({ message: 'CSN does not exists on our records' })

		}
	} catch (e) {
		console.error(e.message)
		return res.status(500).json({ message: 'An internal error happened' })
	}


  const potentialContractURIData = contract.settings.COLLECTION_INFO || {};

  if (potentialContractURIData.name === undefined) {
    // https://eips.ethereum.org/EIPS/eip-7572 requires ["name"], add the contract name
    potentialContractURIData.name = contract.name;
  }
  
  return res.status(200).json(potentialContractURIData)	
}
