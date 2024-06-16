import clsx from 'clsx'
import { id } from 'ethers'
import { Keccak } from 'sha3'

export function formatAddress(address) {
  return `${address?.slice(0, 6)}…${address?.slice(address.length-4, address.length)}`
}

export function cn(...inputs) {
	return clsx(inputs)
}

export function truncate(text, size) {
	if (text.length <= size) {
		return text
	}

	const truncated = text.slice(0, size)

	return truncated + '...'
}

export function discoverPrimaryAsset(nft) {
	if (!nft) {
		return
	}

	if (nft.assets.length) {
		return nft.assets.find((nftAsset) => nftAsset.active && nftAsset.assetType=='image') // The primary asset is always an image
	} else {
		return null
	}
}

const walletRegex =  /^(0x[a-fA-F0-9]{40})$/;
const emailRegex =  /^([\w.-]+@[\w.-]+\.[a-zA-Z]{2,})$/;
const walletOrEmailRegex = new RegExp(`^(${walletRegex.source}|${emailRegex.source})$`);

export function verifyBeneficiary(beneficiary) {
	return walletOrEmailRegex.test(beneficiary)
}

export function beneficiaryToWallet(beneficiary) {
	if(walletRegex.test(beneficiary)) {
		return {
			id: beneficiary,
			wallet_type: "EOA",
			address: beneficiary
		}
	}
	if(emailRegex.test(beneficiary)) {
		return {
			id: beneficiary,
			wallet_type: "EMAIL",
			address: null
		}
	}

	return {
		id: null,
		type: "UNAVAILABLE",
		address: null
	}
}

export function generateAssetURL(contractCsn, assetHash) {
	return `/api/v1/assets/${contractCsn}/${assetHash}`
}

export function generateMetaDataURL(nft) {
	return `/api/v1/collections/${nft.contract.csn}/${nft.anchor}`
}

export function generateNftLandingOptionURL(nft) {
	return `/api/internal/contract/${nft.contract.csn}/config`;
}

export function generateThemeURL(nft) {
	return `/api/internal/contract/${nft.contract.csn}/theme`;
}

export function generateCollectionURL(nft) {
	const relativeUrl = `/collection/${nft.contract.csn}/${nft.anchor}`;
	if(!process.env.NEXTAUTH_URL) {
		return relativeUrl
	}
	return new URL(relativeUrl, process.env.NEXTAUTH_URL).toString();
}

export function getCssCollectionClass(contract) {
	return `collection-${contract.csn.toLowerCase()}`
}

export function pp(json) {
	return JSON.stringify(json, null, 4);
}

// input is string or object
export function jsonify(input) {
	if (typeof input === 'object') {
			// If input is already an object, return it directly
			return input;
	} else if (typeof input === 'string') {
			try {
					// Attempt to parse the string as JSON
					const obj = JSON.parse(input);
					// If successful, return the parsed object
					return obj;
			} catch (e) {
					// If an error occurs, return false indicating the string is not valid JSON
					return null;
			}
	} else {
			// If input is neither an object nor a string, return false
			return null;
	}
}


// Pass "Duck [ANCHOR_SHORT]", {"ANCHOR_SHORT": "0x123..abc"} and it will return "Duck 0x123...abc"
export function fillVariablesIntoString(text, variables) {
    // Function to recursively process strings or objects
    const process = (item) => {
        if (typeof item === 'string') {
            // Replace variables in the string
            return item.replace(/\[([^\]]+)\]/g, function(_, variable) {
                return variables[variable] || "";
            });
        } else if (typeof item === 'object' && item !== null) {
            // Process each property of the object
            for (const key in item) {
                item[key] = process(item[key]);
            }
        }

        return item;
    };

    // Parse the text if it's a JSON string, otherwise process it directly
	// This is needed to account for variables inside arrays in a stringified json-object.
	// A typical occurance is the attributes: [{..}, {..}] array
    try {
        const parsed = JSON.parse(text);
        return JSON.stringify(process(parsed));
    } catch (e) {
		// using catch for program logic is not ideal, but we apply this function typically to JSON-Objects.
		// Maybe refactored later on
        return process(text);
    }
}

export function addressMatch(a, b) {
	if(!a || !b) {
		// as soon as one address is undefined, return false
		return false
	}

	// TODO comprehensive error handling and logging! This can help find issues pretty fast

	// The canonical form is a fixed length, lower-case hex string
	const canonicalA = fixedLengthHexString(a, 40) // a.t.m. ethereum has 20 Byte addresses, zero-pad it
	const canonicalB = fixedLengthHexString(b, 40)

	const isMatch = canonicalA == canonicalB
	//console.log(`Address-Match ${a} (${canonicalA}) <> ${b} (${canonicalB})? ${isMatch} `)

	return isMatch
}

export function fixedLengthHexString(address, length) {
	// Returns a lower-case hex string in Format 0x{length}
	const hexPart = address.toLowerCase().replace(/^0x/, "")
	const paddedHexPart = hexPart.padStart(length, '0')
	return `0x${paddedHexPart}`
}

export function nftDefined(nft) {
	if(!nft) {
		return false;
	}

	const hasActiveAssets = nft.assets.filter( (a) => {return a.active}).length > 0
	const hasMetadata = nft.metadata && Object.keys(nft.metadata).length > 0
	return hasActiveAssets || hasMetadata
}

export async function computeKeccak256Hash(fileStream) {
	const keccakHash = new Keccak(256)

	return new Promise((resolve, reject) => {
		fileStream
			.on('data', (chunk) => {
				keccakHash.update(chunk)
			})
			.on('end', () => {
				// Simulates the same applied by the ethers library
				const hash = '0x' + keccakHash.digest('hex')
				resolve(hash)
			})
			.on('error', (error) => {
				reject(error)
			})
	})
}

export function computeCsnFileHash(csn, hashedFileStr) {
	return id(`${csn}:${hashedFileStr}`)
}

export function inChunks(arr, chunkSize) {
	return Array.from({ length: Math.ceil(arr.length / chunkSize)}, (_, index) =>
		arr.slice(index * chunkSize, (index + 1) * chunkSize)
	)
}
