import useSWR from 'swr'
import { generateAssetURL } from '@/lib/utils'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export const useAssets = (contractCsn) => {
	if (!contractCsn) {
		return {
			assets: [],
			isLoading: true
		}
	}

	const { data, error, isLoading, mutate } = useSWR(
		`/api/internal/assets/${contractCsn}`, fetcher
	)


	const assets = data?.assets.map((asset) => {
		return {
			...asset,
			assetURL: generateAssetURL(
				contractCsn, asset.assetHash
			)
		}
	})

	return {
		assets: assets || [],
		error,
		mutate,
		isLoading
	}
}
