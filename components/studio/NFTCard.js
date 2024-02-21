import { truncate, formatAddress, cn, discoverPrimaryAsset, generateAssetURL } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import NFTCaption from './NFTCaption'

const NFTCard = ({ nft, contractName, staticCaption, ...props }) => {
	const cardRootClassName = cn(`
		card card-compact rounded-lg w-64 bg-shark-900 shadow-xl border
		transition ease-in-out
		border-raven-700 hover:border-white
		`
	)

	const primaryAsset = discoverPrimaryAsset(nft)
	const assetURL  = primaryAsset ? generateAssetURL(nft.contract.csn, primaryAsset?.asset?.assetHash) : null

	return (
		<Link href={`/studio/${nft.contract.csn.toLowerCase()}/${nft.anchor}/edit`}
			  className={cardRootClassName}>
			<figure className="w-[254px] h-[254px] object-cover relative">
				{primaryAsset ? (
					<Image src={assetURL}
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						fill alt={nft.metadata?.description} />
				) : (
					<Image src="/nft-fallback-cover.webp" fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						   alt={nft.metadata?.description} />
				)}
			</figure>
			<div className="card-body pb-[5px]">
				<div className="flex flex-row items-end justify-between">
					<NFTCaption nft={nft} staticCaption={staticCaption} />
				</div>
			</div>
		</Link>
	)
}

export default NFTCard
