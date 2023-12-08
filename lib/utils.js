import clsx from 'clsx'

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
	if (nft.assets.length) {
		return nft.assets.find((nftAsset) => nftAsset.active && nftAsset.assetType=='image') // The primary asset is always an image
	} else {
		return null
	}
}

export function generateAssetURL(contractCsn, assetHash) {
	return `/api/v1/assets/${contractCsn}/${assetHash}`
}

export function generateMetaDataURL(nft) {
	return `/api/v1/collections/${nft.contract.csn}/${nft.anchor}`
}

export function pp(json) {
	return JSON.stringify(json, null, 4);
}

// Pass "Duck [ANCHOR_SHORT]", {"ANCHOR_SHORT": "0x123..abc"} and it will return "Duck 0x123...abc"
export function fillVariablesIntoString(text, variables) {
    // Function to recursively process strings or objects
    const process = (item) => {
        if (typeof item === 'string') {
            // Replace variables in the string
            return item.replace(/\[([^\]]+)\]/g, function(_, variable) {
                return variables[variable] || `[${variable}]`;
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