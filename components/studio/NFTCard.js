import { truncate, formatAddress, cn } from '@/lib/utils'
import Link from 'next/link'

const NFTCard = ({ nft, contractName, ...props }) => {
	const cardRootClassName = cn(`
		card card-compact rounded-lg w-64 bg-shark-900 shadow-xl border
		border-raven-700 hover:border-white
		`
	)

	return (
		<Link href={`/studio/${nft.contract.csn.toLowerCase()}/${nft.anchor}`}
			  className={cardRootClassName}>
			<figure>
				<img src="/nft-fallback-cover.webp" alt={nft.metadata?.description} />
			</figure>
			<div className="card-body pb-[5px]">
				<div className="flex flex-row items-end justify-between">
					<div className="flex flex-col text-left">
						<div className="w-full text-gray-400 text-xs">{truncate(nft.contract.csn, 22)}</div>
						<div className="font-bold text-lg">{nft.slid}</div>
					</div>
					<div className="flex flex-col text-right text-gray-400">
						<div className="font-bold text-xs leading-[1.44rem]">
							owner {formatAddress(nft.contract.owner.address)}
						</div>
					</div>
				</div>
			</div>
		</Link>
	)
}

export default NFTCard
