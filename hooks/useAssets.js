import useSWR from 'swr'

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

	return {
		assets: data?.assets || [],
		error,
		mutate,
		isLoading
	}
}
