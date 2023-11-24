import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { formatAddress, fillVariablesIntoString, fixedLengthHexString, nftHasActiveAssets } from '@/lib/utils'

const allowedMethods = ['GET']

function generateCollectionMetadata(nft) {
	// This copies certain values from contract.settings and embeds it into a
	// NFT-metadata stub. This is mainly used to define NFT's name and description.
	const mapKeysFromContractSettings = {
		// SETTINGS_KEY : metadata_key
		// can be extended
		"NFT_NAME": "name",
		"NFT_DESCRIPTION": "description",
	}

	const contractSettings = nft.contract.settings
	let collectionMetadata = {}
	for (const settingsKey in mapKeysFromContractSettings) {
		if (contractSettings.hasOwnProperty(settingsKey)) {
			const metadataKey = mapKeysFromContractSettings[settingsKey];
			collectionMetadata[metadataKey] = contractSettings[settingsKey]
		}
	}

	return collectionMetadata
}

function fillMetadataVariables(metadata, nft) {
	// TODO proper documentation and easier configuration
	// Hardcoding is certainly not the way to go forward
	const variables = {
		// ############### Label-Details
		// This is the anchor in its full length
		// e.g. 0x96af27ebecfb5fcc4631db56c62a3ba2b3bed954740dddaa36c510580a72a2ec
		'ANCHOR': nft.anchor,
		// This is the anchor in short-representation
		// e.g. 0x96af...a2ec
		'ANCHOR_SHORT': formatAddress(nft.anchor),

		// We do NOT expose the SLID, as this is a security risk.
		// Anchors identify a physical object

		// ############### Collection-Details
		// The collection name,
		// e.g. "Rubber Duck Float Club"
		'COLLECTION_NAME': nft.contract.name,
		// The collection short name,
		// e.g. "RDFC"
		'CSN': nft.contract.csn,

		// ############### OnChain-Details
		// The smart contract address in full length
		// e.g. 0xa257b5f7bc9a7058a6c1b33eeafade5b811f101d
		'CONTRACT_ADDRESS': nft.contract.address,
		// The smart contract address in short-representation
		// e.g. 0xa257...f101d
		'CONTRACT_ADDRESS_SHORT': formatAddress(nft.contract.address)
	}

	// The easiest really is to dump metadata to a string and then convert to object again
	const strMetadata = JSON.stringify(metadata)
	const strMetadataFilled = fillVariablesIntoString(strMetadata, variables)
	return JSON.parse(fillVariablesIntoString(strMetadataFilled, variables)) // parse it back to an object
}



export default async function handle(req, res) {
	// TODO: Move this somewhere else, probably as a utility function
	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}

	let contract
	let nft

	// TODO: Sanitize this
	const { csn } = req.query
	const anchor = fixedLengthHexString(req.query.anchor, 64) // Anchors are bytes32, pad to 0x{64} characters

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

	try {
		nft = await prisma.NFT.findFirst({
			where: {
				anchor: anchor,
				contract: {
					is: {
						id: contract.id
					}
				}
			},
			include: {
				assets: {
					include: {
						asset: true
					}
				},
				contract: {
					include: {
						defaultNft: {
							include: {
								assets: {
									include: {
										asset: true
									}
								}
							}
						}
					}
				}
			}
		})

		// ######################### Logic to find NFT or default NFT. At least one of them
		// needs to be defined (so just deliver collection-based settings does NOT work on purpose)
		if (!nft) {
			return res.status(404).json({ message: 'NFT does not exists on our records' })
		}

		if (nft.slid == "0") {
			return res.status(404).json({ message: 'NFT does not exist on our records' })
		}

		let nftToReturn = undefined
		if (nft.metadata || nftHasActiveAssets(nft)) {
			nftToReturn = nft
		} else {
			if (nft.contract?.defaultNft.metadata || nftHasActiveAssets(nft.contract?.defaultNft)) {
				nftToReturn = nft.contract.defaultNft
			}
		}

		if (!nftToReturn) {
			return res.status(404).json({ "message": "No metadata found" })
		}

		// ######################### Collection-based Metadata
		// This will likely bootstrap name + description
		// All this data can be overwritten by the nftToReturn (if the same key is specified there in metadata)
		const collectionBasedMetadata = generateCollectionMetadata(nft)

		// ########################## Assemble NFT-Based metadata and inject assets
		let nftMetaData = nftToReturn.metadata? nftToReturn.metadata : {}
		// Filling the assets
		// Note this overwrites any pre-existing keys
		nftToReturn.assets.filter( (a) => {return a.active}).map((a) => {
			const asset = a.asset

			return nftMetaData[a.assetType] = new URL(
				`/api/v1/assets/${contract.csn}/${asset.assetHash}`,
				process.env.NEXTAUTH_URL
			).toString()
		})

		// ######################### Assemble the final Metadata
		// This merges collectionBasedMetaData and nftMetaData.
		// Any key in nftMetaData will overwrite the value in collectionBased Metadata
		const metadata = fillMetadataVariables({ ...collectionBasedMetadata, ...nftMetaData}, nft)
		return res.json(metadata)
	} catch (e) {
		console.error("Error: ", e)
		res.status(500).json({ message: 'An internal error happened' })
		return
	}
}
