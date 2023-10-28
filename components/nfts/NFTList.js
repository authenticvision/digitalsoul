import React, { useState, useEffect } from 'react'

import { Loading } from '@/components/ui'

const NFTList = ({ contractId, ...props }) => {
	const [nfts, setNFTs] = useState([])
	const [isLoading, setIsLoading] = useState(contractId != undefined)
	const [error, setError] = useState()

	const fetchNFTs = async() => {
		try {
			const response = await fetch(`/api/internal/nfts/${contractId}`)
			const { nfts } = await response.json()

			console.log(nfts)
			setNFTs(nfts)
			setLoading(false)
		} catch (error) {
			setError(error)
		}
	}

	useEffect(() => {
		if (contractId) {
			fetchNFTs()
		}
	}, [contractId])

	return (
		<div className="flex">
			{contractId == undefined && (
				<span className="text-center w-full text-xl font-bold mt-5">
					You don't appear to have claimed any contract yet
				</span>
			)}
			{isLoading && (
				<span>
					<Loading size='lg' />
				</span>
			)}
		</div>
	)
}

export default NFTList
