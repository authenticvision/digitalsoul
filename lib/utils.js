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
    return text.replace(/\[([^\]]+)\]/g, function(_, variable) {
        return variables[variable] || `[${variable}]`;
    });
}

export function addressMatch(a, b) {
	if(!a || !b) {
		// as soon as one address is undefined, return false
		return false
	}

	// TODO comprehensive error handling and logging! This can help find issues pretty fast

	// The canonical form is just the hex-portion of the address
	// without an eventual starting 0x...
	const canonicalA = a.toLowerCase().replace(/^0x/, "") 
	const canonicalB = b.toLowerCase().replace(/^0x/, "")

	const isMatch = canonicalA == canonicalB

	console.log(`Address-Match ${a} (${canonicalA}) <> ${b} (${canonicalB})? ${isMatch} `)
	return isMatch
}
