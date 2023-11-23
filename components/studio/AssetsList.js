import React, { useState, useEffect } from 'react'

import { Loading } from '@/components/ui'
import { useRouter } from 'next/router'
import { useAssets } from '@/hooks'

import { Header } from '@/components/studio'
import { discoverPrimaryAsset, generateAssetURL } from '@/lib/utils'

import { PlusCircleIcon } from '@heroicons/react/24/outline'

const AssetCard = ({ asset, csn, ...props }) => {
	const assetURL  = generateAssetURL(
		csn, asset.assetHash
	)

	return (
		<div className="relative">
			<img className="h-auto max-w-full rounded-lg" src={assetURL} />
		</div>
	)
}

const AssetsList = ({ contract, ...props }) => {
	const router = useRouter()
	const { csn } = router.query
	const { assets, error, isLoading } = useAssets(contract.csn)
	const [mode, setMode] = useState('card')

	const onAddAsset = () => {
	}

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

						<div className="flex mr-8 pb-8 items-center">
							<button onClick={onAddAsset} className="flex items-center justify-center w-10 h-10 rounded-full bg-raven-700 hover:bg-raven-600">
								<PlusCircleIcon className="w-6 h-6 text-white" />
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 ml-8 pr-4">
						{assets.map((asset) => (
							<AssetCard key={asset.id} csn={contract.csn} asset={asset} />
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
