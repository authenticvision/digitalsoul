import React from 'react'
import { WalletAddress } from '@/components/landing'
import phoneTransferOutIcon from '@/public/icons/phone_transfer_out.svg'
import Image from 'next/image'


const LostCardView = ({ wallet, newOwner, ...props}) => {
	return (
		<div className="flex flex-col">
			<div className="flex flex-col justify-center text-center mx-5">
				<p className="font-bold text-4xl text-white text-center">NFT Transferred</p>
					<Image src={phoneTransferOutIcon} className="w-full pt-10 mt-5" />
			</div>
			<div className="flex mt-5">
				<WalletAddress address={newOwner} />
			</div>
			<div className="text-slate-700 text-center justify-center">
				new owner wallet
			</div>
		</div>
	)
}

export default LostCardView
