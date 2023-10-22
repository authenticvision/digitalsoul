import React, { useCallback } from 'react'
import { WalletAddress } from '@/components/landing'
import { formatAddress } from '@/lib/utils'

const OwnerCardView = ({ nft, wallet, ...props}) => {
	const Description = useCallback(() => {
		return (
			<div className="collapse collapse-arrow rounded-lg bg-[#dfdfdf] text-[#505157]">
				<input type="checkbox" className="min-h-[0.75rem]" />
				<div className="collapse-title py-2 min-h-[0.75rem] text-xl font-medium">
					Description
				</div>
				<div className="collapse-content">
					<p>{nft.metadata.description}</p>
				</div>
			</div>
		)
	}, [nft])

	const Traits = useCallback(() => {
		return (
			<div className="collapse collapse-arrow rounded-lg bg-[#dfdfdf] text-[#505157] mt-6">
				<input type="checkbox" className="min-h-[0.75rem]" />
				<div className="collapse-title py-2 min-h-[0.75rem] text-xl font-medium">
					Traits
				</div>
				<div className="collapse-content">
					{nft.metadata.attributes.length > 0 && (
						<ul>
							{nft.metadata.attributes.map((prop, index) => (
								Object.keys(prop).map((item, itemIndex) => (
									<li key={itemIndex}>
										{item}: {prop[item]}
									</li>
								))
							))}
						</ul>
					)}

					{nft.metadata.attributes.length == 0 && (
						<span>There is no attributes defined for this NFT</span>
					)}
				</div>
			</div>
		)
	}, [nft])

	return (
		<div className="flex flex-col">
			<div className="flex flex-col justify-center text-center mx-5">
				<img src="https://placehold.co/600x400/EEE/31343C" />
				<WalletAddress address={wallet.address} />
			</div>

			<div className="text-slate-700 text-center justify-center">
				owning wallet
			</div>

			<div className="flex flex-col mt-8">
				<Description />
				<Traits />
			</div>
		</div>
	)
}

export default OwnerCardView
