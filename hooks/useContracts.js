import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export const useContracts = (csn, address) => {
	if (!address || !csn) {
		return {
			contracts: [],
			isLoading: true
		}
	}

	const { data, error, isLoading, mutate } = useSWR(
		`/api/internal/wallets/${address}/contracts`, fetcher
	)

	return {
		contracts: data?.contracts || [],
		error,
		mutate,
		isLoading
	}
}
