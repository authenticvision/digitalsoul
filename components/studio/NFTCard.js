import { truncate, formatAddress, cn, generateAssetURL } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

const NFTCard = ({ nft, contractName, ...props }) => {
	const cardRootClassName = cn(`
		card card-compact rounded-lg w-64 bg-shark-900 shadow-xl border
		transition ease-in-out
		border-raven-700 hover:border-white
		`
	)

	const hasAssets = nft.assets.length > 0
	const assetURL  = hasAssets ? generateAssetURL(nft.assets[0].assetHash) : null

	return (
		<Link href={`/studio/${nft.contract.csn.toLowerCase()}/${nft.anchor}`}
			  className={cardRootClassName}>
			<figure className="w-[254px] h-[254px] object-cover relative">
				{hasAssets? (
					<Image src={assetURL} fill alt={nft.metadata?.description} />
				) : (
					<Image src="/nft-fallback-cover.webp" fill
						   alt={nft.metadata?.description} />
				)}
			</figure>
			<div className="card-body pb-[5px]">
				<div className="flex flex-row items-end justify-between">
					<div className="flex flex-col text-left">
						<div className="w-full text-gray-400 text-xs">
							{truncate(nft.contract.csn, 22)}
						</div>
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
