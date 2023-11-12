import clsx from 'clsx'

export function formatAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(address.length-4, address.length)}`
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

export function generateAssetURL(assetHash) {
	return `/api/v1/assets/${assetHash}`
}

export function generateMetaDataURL(nft) {
	return `/api/v1/collections/${nft.contract.csn}/${nft.anchor}`
}

export function pp(json) {
	return JSON.stringify(json, null, 4);
}
