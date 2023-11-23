import React, { useState, useEffect } from 'react'

import { Loading } from '@/components/ui'
import { useRouter } from 'next/router'
import { useAssets } from '@/hooks'

import { Header } from '@/components/studio'

const AssetCard = ({ asset, ...props }) => {
	return (
		<div>{asset.id}</div>
	)
}

const AssetsList = ({ contract, ...props }) => {
	const router = useRouter()
	const { csn } = router.query
	const { assets, error, isLoading } = useAssets(contract.csn)
	const [mode, setMode] = useState('card')

	return (
		<div className="flex">
			{contract == undefined && (
				<span className="text-center w-full text-xl font-bold mt-5">
					You don't appear to have uploaded any assets
				</span>
			)}

			{isLoading && (
				<span className="w-full text-center">
					<Loading size='lg' />
				</span>
			)}

			{(!isLoading && assets.length > 0) && (
				<div className="flex flex-col text-center w-full text-xl font-bold mt-5">
					<div className="flex border-b border-raven-700">
						<Header contractName={contract.name}
								title={'Assets'}
								disableInteractions={true} />
					</div>

					<div className="flex w-full ml-8 mt-8">
						{assets.map((asset) => (
							<AssetCard key={asset.id} asset={asset} />
						))}
					</div>
				</div>
			)}

			{(!isLoading && assets.length == 0) && (
				<span className="text-center w-full text-xl font-bold mt-5">
					You don't have any Assets within this Contract
				</span>
			)}
		</div>
	)
}

export default AssetsList
