import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export const useNFTs = (contractId) => {
	if (!contractId) {
		return {
			nfts: [],
			isLoading: true
		}
	}

	const { data, error, isLoading, mutate } = useSWR(
		`/api/internal/nfts/${contractId}`, fetcher
	)

	return {
		nfts: data?.nfts,
		error,
		mutate,
		isLoading
	}
}
