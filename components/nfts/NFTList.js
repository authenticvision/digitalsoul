"use client";
import React, { useState, useEffect } from 'react'

import { Loading } from '@/components/ui'
import { useRouter } from 'next/router'

const NFTList = ({ contractId, ...props }) => {
	const router = useRouter()
	const { csn } = router.query

	const [nfts, setNFTs] = useState([])
	const [isLoading, setIsLoading] = useState(contractId != undefined)
	const [error, setError] = useState()

	useEffect(() => {
		async function fetchNFTs() {
			try {
				const response = await fetch(`/api/internal/nfts/${contractId}`)
				const { nfts } = await response.json()

				setNFTs(nfts)
				setIsLoading(false)
			} catch (error) {
				setError(error)
				setIsLoading(false)
			}
		}

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
				<span className="w-full text-center">
					<Loading size='lg' />
				</span>
			)}

			{(!isLoading && nfts.length > 0) && (
				<span className="text-center w-full text-xl font-bold mt-5">
					NFTs count: {nfts.length}
				</span>
			)}

			{(!isLoading && nfts.length == 0) && (
				<span className="text-center w-full text-xl font-bold mt-5">
					You don't have any NFTs with this Contract
				</span>
			)}
		</div>
	)
}

export default NFTList
