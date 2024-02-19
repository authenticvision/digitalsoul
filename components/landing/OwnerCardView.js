import React, { useCallback } from 'react'
import { NFTLinks, Wallet } from '@/components/landing'
import { NFTImage } from '@/components/landing'
import { WalletLoginButton } from '@/components/landing'
import { formatAddress } from '@/lib/utils'

const OwnerCardView = ({ wallet, assetData, ...props}) => {
	return (
		<div className="flex flex-col">
			<div className="flex flex-col justify-center text-center mx-5">
				<NFTImage assetData={assetData} />
				<NFTLinks assetData={assetData} />
				<Wallet wallet={wallet} />
			</div>
			<div className="text-slate-700 text-center justify-center">
				owning wallet
			</div>
			<div>
				<WalletLoginButton wallet={wallet} />
			</div>
		</div>
	)
}

export default OwnerCardView
