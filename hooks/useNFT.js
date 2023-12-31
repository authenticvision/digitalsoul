import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export const useNFT = ({csn, anchor}) => {
	const { data, error, isLoading, mutate } = useSWR(
		`/api/internal/nft/${csn}/${anchor}`, fetcher
	)

	return {
		nft: data,
		error,
		mutate,
		isLoading
	}
}
