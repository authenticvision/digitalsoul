import { truncate, formatAddress } from '@/lib/utils'

const NFTCard = ({ nft, contractName, ...props }) => {
	return (
		<div className="card card-compact rounded-lg w-64 bg-base-100 shadow-xl border border-white">
			<figure>
				<img src="/nft-fallback-cover.webp" alt={nft.metadata.description} />
			</figure>
			<div className="card-body pb-[5px]">
				<div className="flex flex-row items-end justify-between">
					<div className="flex flex-col text-left">
						<div className="w-full text-gray-400 text-xs">{truncate(nft.contract.name, 22)}</div>
						<div className="font-bold text-lg">{nft.slid}</div>
					</div>

					<div className="flex flex-col text-right text-gray-400">
						<div className="w-full font-gray-200 text-xs">
							01.01.2001
						</div>

						<div className="font-bold text-xs leading-[1.44rem]">
							owner {formatAddress(nft.contract.owner.address)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default NFTCard
