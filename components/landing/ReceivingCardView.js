import React, { useCallback } from 'react'
import Lottie from "lottie-react";
import { WalletAddress } from '@/components/landing'
import receivingNFTAnimation from "@/lib/receivingNFT.json";

const ReceivingCardView = ({ wallet, assetData, ...props}) => {
	return (
		<div className="flex flex-col">
			<div className="flex flex-col justify-center text-center mx-5">
				<p className="font-bold text-4xl text-white text-center">receiving NFT</p>
				<div className="w-full p-2 mt-5">
					<Lottie animationData={receivingNFTAnimation} />
				</div>
			</div>

			<div className="flex mt-5">
				<WalletAddress address={assetData.owner} />
			</div>

			<div className="text-slate-700 text-center justify-center">
				receiving from
			</div>
		</div>
	)
}

export default ReceivingCardView
