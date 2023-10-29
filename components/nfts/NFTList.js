"use client";
import React, { useState, useEffect } from 'react'

import { Loading } from '@/components/ui'
import { useRouter } from 'next/router'

import { Header, NFTTable, NFTCards } from '@/components/studio'

const NFTList = ({ contractId, contractName, ...props }) => {
	const router = useRouter()
	const { csn } = router.query

	const [nfts, setNFTs] = useState([])
	const [isLoading, setIsLoading] = useState(contractId != undefined)
	const [error, setError] = useState()
	const [mode, setMode] = useState('card')

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

	const onChangeMode = (mode) => {
		setMode(mode)
	}

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
				<div className="flex flex-col text-center w-full text-xl font-bold mt-5">
					<div className="flex border-b border-raven-700">
						<Header contractName={contractName}
								mode={mode}
								onChangeMode={onChangeMode} />
					</div>

					<div className="flex w-full ml-8 mt-8">
						{mode == 'card' ? (
							<NFTCards nfts={nfts}  contractName={contractName} />
						) : (
							<NFTTable nfts={nfts} contractName={contractName} />
						)}
					</div>
				</div>
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
