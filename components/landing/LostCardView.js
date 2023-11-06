import React, { useCallback } from 'react'
import Lottie from "lottie-react";
import { WalletAddress } from '@/components/landing'

// TODO: Replace with correct icon or animation
import receivingNFTAnimation from "@/lib/receivingNFT.json";

const LostCardView = ({ wallet, newOwner, ...props}) => {
	return (
		<div className="flex flex-col">
			<div className="flex flex-col justify-center text-center mx-5">
				<p className="font-bold text-4xl text-white text-center">NFT transferred</p>
				<div className="w-full p-2 mt-5">
					TODO IMAGE OF TRANSFERRED
				</div>
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
